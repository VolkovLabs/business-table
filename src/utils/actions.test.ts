import { locationService } from '@grafana/runtime';
import { TableConfig } from '@/types';
import { onRequestSuccess } from './actions';

jest.mock('@grafana/runtime', () => ({
  locationService: {
    partial: jest.fn(),
  },
}));

describe('onRequestSuccess', () => {
  let notifySuccess: jest.Mock;
  let refreshDashboard: jest.Mock;

  beforeEach(() => {
    notifySuccess = jest.fn();
    refreshDashboard = jest.fn();
    jest.clearAllMocks();
  });

  it('Should call notifySuccess and refreshDashboard for add operation', () => {
    onRequestSuccess(notifySuccess, refreshDashboard, undefined, 'add', {});

    expect(notifySuccess).toHaveBeenCalled();
    expect(refreshDashboard).toHaveBeenCalled();
    expect(locationService.partial).not.toHaveBeenCalled();
  });

  it('Should call notifySuccess and refreshDashboard for delete without highlight state', () => {
    onRequestSuccess(notifySuccess, refreshDashboard, undefined, 'delete', {});

    expect(notifySuccess).toHaveBeenCalled();
    expect(refreshDashboard).toHaveBeenCalled();
    expect(locationService.partial).not.toHaveBeenCalled();
  });

  it('Should call notifySuccess and refreshDashboard for delete with highlight state but without resetVariable', () => {
    const row = { __rowHighlightStateKey: true };
    const table: TableConfig = {
      rowHighlight: { resetVariable: false, variable: 'testVar' },
    } as any;

    onRequestSuccess(notifySuccess, refreshDashboard, table, 'delete', row);

    expect(notifySuccess).toHaveBeenCalled();
    expect(refreshDashboard).toHaveBeenCalled();
    expect(locationService.partial).not.toHaveBeenCalled();
  });

  it('Should call notifySuccess and refreshDashboard for delete with highlight state but without resetVariable if __rowHighlightStateKey is undefined', () => {
    const row = { __rowHighlightStateKey: undefined };
    const table: TableConfig = {
      rowHighlight: { resetVariable: true, variable: 'testVar' },
    } as any;

    onRequestSuccess(notifySuccess, refreshDashboard, table, 'delete', row);

    expect(notifySuccess).toHaveBeenCalled();
    expect(refreshDashboard).toHaveBeenCalled();
    expect(locationService.partial).not.toHaveBeenCalled();
  });

  it('Should call notifySuccess and locationService.partial but not refreshDashboard when resetVariable is true', () => {
    const row = { __rowHighlightStateKey: true };
    const table: TableConfig = {
      rowHighlight: { resetVariable: true, variable: 'testVar' },
    } as any;

    onRequestSuccess(notifySuccess, refreshDashboard, table, 'delete', row);

    expect(notifySuccess).toHaveBeenCalled();
    expect(locationService.partial).toHaveBeenCalledWith({ 'var-testVar': '' }, true);

    /**
     * Means Refresh call inside locationService
     */
    expect(refreshDashboard).not.toHaveBeenCalled();
  });
});
