import { Grid } from 'antd';

/** true khi màn hình nhỏ hơn 768px (điện thoại) */
export function useIsMobile(): boolean {
  const screens = Grid.useBreakpoint();
  return screens.md === false;
}

