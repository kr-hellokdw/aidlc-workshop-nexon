import { authHandlers } from './auth';
import { dashboardHandlers } from './dashboard';
import { tableHandlers } from './tables';
import { menuHandlers } from './menus';

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...tableHandlers,
  ...menuHandlers,
];
