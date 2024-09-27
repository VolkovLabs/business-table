import { OrgRole, toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { PermissionMode } from '@/types';
import { createPermissionConfig } from '@/utils';

import { PermissionEditor } from './PermissionEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof PermissionEditor>;

describe('PermissionEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.permissionEditor);
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <PermissionEditor value={createPermissionConfig({})} onChange={onChange} {...(props as any)} />;
  };

  it('Should allow to set mode', () => {
    render(
      getComponent({
        value: createPermissionConfig({
          mode: PermissionMode.ALLOWED,
        }),
      })
    );

    expect(selectors.fieldMode()).toBeInTheDocument();

    fireEvent.change(selectors.fieldMode(), { target: { value: PermissionMode.USER_ROLE } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: PermissionMode.USER_ROLE,
      })
    );
  });

  it('Should allow to set user role', () => {
    render(
      getComponent({
        value: createPermissionConfig({
          mode: PermissionMode.USER_ROLE,
          userRole: [],
        }),
      })
    );

    expect(selectors.fieldOrgRole()).toBeInTheDocument();

    fireEvent.change(selectors.fieldOrgRole(), { target: { values: [OrgRole.Admin] } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        userRole: [OrgRole.Admin],
      })
    );
  });

  it('Should allow to clear user role', () => {
    render(
      getComponent({
        value: createPermissionConfig({
          mode: PermissionMode.USER_ROLE,
          userRole: [OrgRole.Admin],
        }),
      })
    );

    expect(selectors.fieldOrgRole()).toBeInTheDocument();

    fireEvent.change(selectors.fieldOrgRole(), { target: { value: '', values: [] } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        userRole: [],
      })
    );
  });

  it('Should allow to set permission field', () => {
    render(
      getComponent({
        value: createPermissionConfig({
          mode: PermissionMode.QUERY,
          userRole: [],
        }),
        data: [toDataFrame({ refId: 'A', fields: [{ name: 'edit', values: [true] }] })],
      })
    );

    expect(selectors.fieldPicker()).toBeInTheDocument();

    fireEvent.change(selectors.fieldPicker(), { target: { value: 'A:edit' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        field: {
          source: 'A',
          name: 'edit',
        },
      })
    );
  });
});
