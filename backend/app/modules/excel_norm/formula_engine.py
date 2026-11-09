"""Excel Formula Evaluator for 3DoHub Excel Print & Table Normalizer.
Evaluates Excel formulas (=SUM, =IF, =VLOOKUP, =SUMIF, =ROUND, arithmetic, ranges, etc.)
on openpyxl Worksheets while preserving raw formula strings for .xlsx export and web editing.
"""

import ast
import datetime
import math
import re
from typing import Any, Optional
from openpyxl.utils import column_index_from_string

CELL_REF_RE = re.compile(
    r"(?:(?:'([^']+)'|([A-Za-z0-9_À-ỹ]+))!)?"
    r"\$?([A-Za-z]{1,3})\$?(\d{1,7})"
    r"(?::\$?([A-Za-z]{1,3})\$?(\d{1,7}))?"
)


def is_formula(val: Any) -> bool:
    return isinstance(val, str) and val.strip().startswith("=")


def to_num(val: Any) -> float:
    if val is None or val == "":
        return 0.0
    if isinstance(val, bool):
        return 1.0 if val else 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip().replace(",", "")
    if s.endswith("%"):
        try:
            return float(s[:-1]) / 100.0
        except ValueError:
            return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0


def is_num_val(val: Any) -> bool:
    if isinstance(val, bool) or val is None or val == "":
        return False
    if isinstance(val, (int, float)):
        return True
    s = str(val).strip().replace(",", "")
    try:
        float(s)
        return True
    except ValueError:
        return False


def _flatten_args(args: Any) -> list[Any]:
    out: list[Any] = []
    for a in args:
        if isinstance(a, list):
            out.extend(_flatten_args(a))
        else:
            out.append(a)
    return out


def _matches_criteria(val: Any, criteria: Any) -> bool:
    if criteria is None:
        return val is None or val == ""
    c_str = str(criteria).strip()
    for op in (">=", "<=", "<>", "!=", ">", "<", "="):
        if c_str.startswith(op):
            rhs = c_str[len(op) :].strip()
            if is_num_val(val) and is_num_val(rhs):
                v_n, r_n = to_num(val), to_num(rhs)
                if op == ">=":
                    return v_n >= r_n
                if op == "<=":
                    return v_n <= r_n
                if op in ("<>", "!="):
                    return v_n != r_n
                if op == ">":
                    return v_n > r_n
                if op == "<":
                    return v_n < r_n
                return v_n == r_n
            v_s = "" if val is None else str(val).strip().upper()
            r_s = rhs.strip().strip('"').upper()
            if op in ("<>", "!="):
                return v_s != r_s
            if op == "=":
                return v_s == r_s
            return False
    if is_num_val(val) and is_num_val(c_str):
        return to_num(val) == to_num(c_str)
    return ("" if val is None else str(val).strip().upper()) == c_str.upper()


class _WorksheetFormulaContext:
    def __init__(
        self,
        ws: Any,
        cached_ws: Optional[Any] = None,
        wb_sheets: Optional[dict[str, Any]] = None,
        cached_sheets: Optional[dict[str, Any]] = None,
    ) -> None:
        self.ws = ws
        self.cached_ws = cached_ws
        self.wb_sheets = wb_sheets or {ws.title: ws}
        self.cached_sheets = cached_sheets or ({cached_ws.title: cached_ws} if cached_ws else {})
        self.memo: dict[tuple[str, int, int], Any] = {}
        self.visiting: set[tuple[str, int, int]] = set()

    def get_cell_value(self, row: int, col: int, sheet_name: Optional[str] = None) -> Any:
        target_ws = self.wb_sheets.get(sheet_name, self.ws) if sheet_name else self.ws
        target_cached = (
            self.cached_sheets.get(sheet_name, self.cached_ws) if sheet_name else self.cached_ws
        )
        key = (target_ws.title, row, col)
        if key in self.memo:
            return self.memo[key]
        if key in self.visiting:
            return 0  # Circular reference guard

        raw = target_ws.cell(row=row, column=col).value
        if not is_formula(raw):
            self.memo[key] = raw
            return raw

        self.visiting.add(key)
        try:
            res = self.eval_formula(str(raw), current_row=row, current_col=col, sheet_name=target_ws.title)
            if res is None and target_cached is not None:
                res = target_cached.cell(row=row, column=col).value
        except Exception:
            res = target_cached.cell(row=row, column=col).value if target_cached is not None else "#VALUE!"
        finally:
            self.visiting.discard(key)

        if isinstance(res, float) and res.is_integer() and abs(res) < 10**15:
            res = int(res)
        self.memo[key] = res
        return res

    def get_range_2d(
        self, c1_s: str, r1_s: str, c2_s: str, r2_s: str, sheet_name: Optional[str] = None
    ) -> list[list[Any]]:
        c1, r1 = column_index_from_string(c1_s), int(r1_s)
        c2, r2 = column_index_from_string(c2_s), int(r2_s)
        min_r, max_r = min(r1, r2), min(min(r1, r2) + 500, max(r1, r2))
        min_c, max_c = min(c1, c2), min(min(c1, c2) + 80, max(c1, c2))
        rows: list[list[Any]] = []
        for r in range(min_r, max_r + 1):
            rows.append([self.get_cell_value(r, c, sheet_name) for c in range(min_c, max_c + 1)])
        return rows

    def eval_formula(
        self, formula_str: str, current_row: int = 1, current_col: int = 1, sheet_name: Optional[str] = None
    ) -> Any:
        expr = formula_str.strip()[1:].strip()
        if not expr:
            return ""

        # Protect string literals before transforming Excel syntax to Python AST
        strings: list[str] = []

        def _save_str(m: re.Match) -> str:
            idx = len(strings)
            strings.append(m.group(1).replace('""', '"'))
            return f"__STR_{idx}__"

        expr = re.sub(r'"((?:[^"]|"")*)"', _save_str, expr)
        expr = expr.replace(";", ",")

        def _replace_ref(m: re.Match) -> str:
            s_quoted, s_plain, col1, row1, col2, row2 = m.groups()
            sh = s_quoted or s_plain or sheet_name or ""
            sh_arg = repr(sh) if sh else "None"
            if col2 and row2:
                return f"__RNG__({repr(col1)},{repr(row1)},{repr(col2)},{repr(row2)},{sh_arg})"
            return f"__CELL__({int(row1)},{column_index_from_string(col1)},{sh_arg})"

        # Replace cell ranges and cell references (ignoring function names followed by '(')
        expr = re.sub(
            r"(?:(?:'([^']+)'|([A-Za-z0-9_À-ỹ]+))!)?"
            r"\$?([A-Za-z]{1,3})\$?(\d{1,7})"
            r"(?::\$?([A-Za-z]{1,3})\$?(\d{1,7}))?(?!\s*\()",
            _replace_ref,
            expr,
        )

        # Normalize Excel operators to Python operators
        expr = expr.replace("<>", "!=")
        expr = re.sub(r"(?<![<>!=])=(?!=)", "==", expr)
        expr = expr.replace("^", "**")
        expr = re.sub(r"(\d+(?:\.\d+)?)%", r"(\1*0.01)", expr)

        # Upper-case function identifiers
        expr = re.sub(r"\b([A-Za-z_][A-Za-z0-9_.]*)\s*(?=\()", lambda m: m.group(1).upper().replace(".", "_"), expr)

        for idx, s_val in enumerate(strings):
            expr = expr.replace(f"__STR_{idx}__", repr(s_val))

        tree = ast.parse(expr, mode="eval")
        return self._eval_ast(tree.body, current_row, current_col)

    def _eval_ast(self, node: ast.AST, cur_r: int, cur_c: int) -> Any:
        if isinstance(node, ast.Constant):
            return node.value
        if isinstance(node, ast.UnaryOp):
            val = self._eval_ast(node.operand, cur_r, cur_c)
            if isinstance(node.op, ast.USub):
                return -to_num(val)
            if isinstance(node.op, ast.UAdd):
                return to_num(val)
            if isinstance(node.op, ast.Not):
                return not bool(val)
        if isinstance(node, ast.BinOp):
            left = self._eval_ast(node.left, cur_r, cur_c)
            right = self._eval_ast(node.right, cur_r, cur_c)
            if isinstance(node.op, ast.BitAnd):
                return f"{'' if left is None else left}{'' if right is None else right}"
            l_num, r_num = to_num(left), to_num(right)
            if isinstance(node.op, ast.Add):
                return l_num + r_num
            if isinstance(node.op, ast.Sub):
                return l_num - r_num
            if isinstance(node.op, ast.Mult):
                return l_num * r_num
            if isinstance(node.op, ast.Div):
                return (l_num / r_num) if r_num != 0 else "#DIV/0!"
            if isinstance(node.op, ast.Pow):
                return math.pow(l_num, r_num)
        if isinstance(node, ast.Compare):
            left = self._eval_ast(node.left, cur_r, cur_c)
            for op, comp in zip(node.ops, node.comparators):
                right = self._eval_ast(comp, cur_r, cur_c)
                if is_num_val(left) and is_num_val(right):
                    l_v, r_v = to_num(left), to_num(right)
                else:
                    l_v = "" if left is None else str(left).strip().upper()
                    r_v = "" if right is None else str(right).strip().upper()
                ok = (
                    (l_v == r_v if isinstance(op, ast.Eq) else False)
                    or (l_v != r_v if isinstance(op, ast.NotEq) else False)
                    or (l_v < r_v if isinstance(op, ast.Lt) else False)
                    or (l_v <= r_v if isinstance(op, ast.LtE) else False)
                    or (l_v > r_v if isinstance(op, ast.Gt) else False)
                    or (l_v >= r_v if isinstance(op, ast.GtE) else False)
                )
                if not ok:
                    return False
                left = right
            return True
        if isinstance(node, ast.Name):
            uid = node.id.upper()
            if uid == "TRUE":
                return True
            if uid == "FALSE":
                return False
            return 0
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            fn = node.func.id.upper()
            if fn == "__CELL__":
                args = [self._eval_ast(a, cur_r, cur_c) for a in node.args]
                return self.get_cell_value(int(args[0]), int(args[1]), args[2])
            if fn == "__RNG__":
                args = [self._eval_ast(a, cur_r, cur_c) for a in node.args]
                return self.get_range_2d(str(args[0]), str(args[1]), str(args[2]), str(args[3]), args[4])
            if fn == "IF":
                cond = self._eval_ast(node.args[0], cur_r, cur_c) if node.args else False
                if bool(cond) and cond != 0:
                    return self._eval_ast(node.args[1], cur_r, cur_c) if len(node.args) > 1 else True
                return self._eval_ast(node.args[2], cur_r, cur_c) if len(node.args) > 2 else False
            if fn in ("IFERROR", "IFNA"):
                try:
                    val = self._eval_ast(node.args[0], cur_r, cur_c)
                    if isinstance(val, str) and val.startswith("#"):
                        return self._eval_ast(node.args[1], cur_r, cur_c) if len(node.args) > 1 else ""
                    return val
                except Exception:
                    return self._eval_ast(node.args[1], cur_r, cur_c) if len(node.args) > 1 else ""
            args = [self._eval_ast(a, cur_r, cur_c) for a in node.args]
            return self._call_excel_func(fn, args, cur_r, cur_c)
        return None

    def _call_excel_func(self, fn: str, args: list[Any], cur_r: int, cur_c: int) -> Any:
        flat = _flatten_args(args)
        nums = [to_num(v) for v in flat if is_num_val(v)]
        if fn == "SUM":
            return sum(nums)
        if fn == "AVERAGE":
            return (sum(nums) / len(nums)) if nums else 0.0
        if fn == "MIN":
            return min(nums) if nums else 0.0
        if fn == "MAX":
            return max(nums) if nums else 0.0
        if fn == "COUNT":
            return len(nums)
        if fn == "COUNTA":
            return sum(1 for v in flat if v is not None and str(v).strip() != "")
        if fn == "COUNTBLANK":
            return sum(1 for v in flat if v is None or str(v).strip() == "")
        if fn == "PRODUCT":
            res = 1.0
            for n in nums:
                res *= n
            return res if nums else 0.0
        if fn == "SUMPRODUCT":
            arrays = [_flatten_args([a]) for a in args]
            if not arrays:
                return 0.0
            min_len = min(len(a) for a in arrays)
            return sum(math.prod(to_num(a[i]) for a in arrays) for i in range(min_len))
        if fn == "SUBTOTAL":
            code = int(to_num(args[0])) if args else 9
            sub_flat = _flatten_args(args[1:])
            sub_nums = [to_num(v) for v in sub_flat if is_num_val(v)]
            if code in (1, 101):
                return (sum(sub_nums) / len(sub_nums)) if sub_nums else 0.0
            if code in (2, 102):
                return len(sub_nums)
            if code in (3, 103):
                return sum(1 for v in sub_flat if v is not None and str(v).strip() != "")
            return sum(sub_nums)
        if fn == "ROUND":
            val = to_num(args[0]) if args else 0.0
            digits = int(to_num(args[1])) if len(args) > 1 else 0
            return round(val, digits)
        if fn == "ROUNDUP":
            val = to_num(args[0]) if args else 0.0
            digits = int(to_num(args[1])) if len(args) > 1 else 0
            factor = 10**digits
            return (math.ceil(val * factor) if val >= 0 else math.floor(val * factor)) / factor
        if fn == "ROUNDDOWN":
            val = to_num(args[0]) if args else 0.0
            digits = int(to_num(args[1])) if len(args) > 1 else 0
            factor = 10**digits
            return math.trunc(val * factor) / factor
        if fn == "INT":
            return math.floor(to_num(args[0])) if args else 0
        if fn == "ABS":
            return abs(to_num(args[0])) if args else 0.0
        if fn == "MOD":
            d = to_num(args[1]) if len(args) > 1 else 1.0
            return (to_num(args[0]) % d) if d != 0 else "#DIV/0!"
        if fn == "POWER":
            return math.pow(to_num(args[0]), to_num(args[1])) if len(args) > 1 else 0.0
        if fn == "SQRT":
            v = to_num(args[0]) if args else 0.0
            return math.sqrt(v) if v >= 0 else "#NUM!"
        if fn == "AND":
            return all(bool(v) for v in flat if v is not None)
        if fn == "OR":
            return any(bool(v) for v in flat if v is not None)
        if fn == "NOT":
            return not bool(args[0]) if args else True
        if fn == "IFS":
            for i in range(0, len(args) - 1, 2):
                if bool(args[i]):
                    return args[i + 1]
            return "#N/A"
        if fn == "COUNTIF" and len(args) >= 2:
            rng_vals = _flatten_args([args[0]])
            return sum(1 for v in rng_vals if _matches_criteria(v, args[1]))
        if fn == "SUMIF" and len(args) >= 2:
            rng_vals = _flatten_args([args[0]])
            sum_vals = _flatten_args([args[2]]) if len(args) >= 3 else rng_vals
            return sum(
                to_num(sum_vals[i])
                for i, v in enumerate(rng_vals)
                if i < len(sum_vals) and _matches_criteria(v, args[1])
            )
        if fn == "AVERAGEIF" and len(args) >= 2:
            rng_vals = _flatten_args([args[0]])
            avg_vals = _flatten_args([args[2]]) if len(args) >= 3 else rng_vals
            matched = [
                to_num(avg_vals[i])
                for i, v in enumerate(rng_vals)
                if i < len(avg_vals) and _matches_criteria(v, args[1]) and is_num_val(avg_vals[i])
            ]
            return (sum(matched) / len(matched)) if matched else 0.0
        if fn == "VLOOKUP" and len(args) >= 3:
            lookup_val = args[0]
            table = args[1] if isinstance(args[1], list) else [[args[1]]]
            col_idx = max(1, int(to_num(args[2]))) - 1
            for row in table:
                if isinstance(row, list) and row and _matches_criteria(row[0], lookup_val):
                    return row[col_idx] if col_idx < len(row) else "#REF!"
            return "#N/A"
        if fn == "HLOOKUP" and len(args) >= 3:
            lookup_val = args[0]
            table = args[1] if isinstance(args[1], list) else [[args[1]]]
            row_idx = max(1, int(to_num(args[2]))) - 1
            if table and isinstance(table[0], list):
                for c_i, top_v in enumerate(table[0]):
                    if _matches_criteria(top_v, lookup_val):
                        return table[row_idx][c_i] if row_idx < len(table) and c_i < len(table[row_idx]) else "#REF!"
            return "#N/A"
        if fn == "INDEX" and len(args) >= 2:
            table = args[0] if isinstance(args[0], list) else [[args[0]]]
            r_i = max(1, int(to_num(args[1]))) - 1
            c_i = (max(1, int(to_num(args[2]))) - 1) if len(args) >= 3 else 0
            if r_i < len(table):
                row = table[r_i]
                if isinstance(row, list):
                    return row[c_i] if c_i < len(row) else "#REF!"
                return row
            return "#REF!"
        if fn == "MATCH" and len(args) >= 2:
            items = _flatten_args([args[0]]) if isinstance(args[0], list) else [args[0]]
            if len(args) >= 2 and isinstance(args[1], list):
                lookup_val = args[0]
                items = _flatten_args([args[1]])
                for idx, item in enumerate(items, start=1):
                    if _matches_criteria(item, lookup_val):
                        return idx
            return "#N/A"
        if fn in ("CONCAT", "CONCATENATE"):
            return "".join("" if v is None else str(v) for v in flat)
        if fn == "LEFT":
            s = "" if not args or args[0] is None else str(args[0])
            n = int(to_num(args[1])) if len(args) > 1 else 1
            return s[: max(0, n)]
        if fn == "RIGHT":
            s = "" if not args or args[0] is None else str(args[0])
            n = int(to_num(args[1])) if len(args) > 1 else 1
            return s[max(0, len(s) - n) :] if n > 0 else ""
        if fn == "MID" and len(args) >= 3:
            s = "" if args[0] is None else str(args[0])
            start = max(1, int(to_num(args[1]))) - 1
            length = max(0, int(to_num(args[2])))
            return s[start : start + length]
        if fn == "LEN":
            return len("" if not args or args[0] is None else str(args[0]))
        if fn == "TRIM":
            return " ".join(("" if not args or args[0] is None else str(args[0])).split())
        if fn == "UPPER":
            return ("" if not args or args[0] is None else str(args[0])).upper()
        if fn == "LOWER":
            return ("" if not args or args[0] is None else str(args[0])).lower()
        if fn == "PROPER":
            return ("" if not args or args[0] is None else str(args[0])).title()
        if fn == "VALUE":
            return to_num(args[0]) if args else 0.0
        if fn == "TEXT" and len(args) >= 1:
            v = args[0]
            if is_num_val(v):
                n = to_num(v)
                return f"{int(round(n)):,}" if n == int(n) else f"{n:,.2f}"
            return "" if v is None else str(v)
        if fn == "ROW":
            return cur_r
        if fn == "COLUMN":
            return cur_c
        if fn in ("TODAY", "NOW"):
            return datetime.date.today().strftime("%d/%m/%Y")
        if fn == "DATE" and len(args) >= 3:
            return f"{int(to_num(args[2])):02d}/{int(to_num(args[1])):02d}/{int(to_num(args[0])):04d}"
        return None


def evaluate_worksheet_formulas(
    ws: Any,
    cached_ws: Optional[Any] = None,
    wb_sheets: Optional[dict[str, Any]] = None,
    cached_sheets: Optional[dict[str, Any]] = None,
) -> dict[tuple[int, int], Any]:
    """Evaluate all cells (including formulas) in a worksheet and return a map {(row, col): evaluated_value}."""
    ctx = _WorksheetFormulaContext(
        ws=ws, cached_ws=cached_ws, wb_sheets=wb_sheets, cached_sheets=cached_sheets
    )
    out: dict[tuple[int, int], Any] = {}
    for r in range(1, ws.max_row + 1):
        for c in range(1, ws.max_column + 1):
            raw = ws.cell(row=r, column=c).value
            if raw is not None:
                out[(r, c)] = ctx.get_cell_value(r, c)
    return out

