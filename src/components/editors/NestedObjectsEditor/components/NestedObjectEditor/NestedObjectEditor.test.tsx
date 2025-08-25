import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { NestedObjectType } from '@/types';
import {
  createNestedObjectConfig,
  createNestedObjectEditorConfig,
  createNestedObjectOperationConfig,
  createTableRequestConfig,
} from '@/utils';

import { NestedObjectEditor } from './NestedObjectEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof NestedObjectEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  requestEditor: createSelector('data-testid request-editor'),
  operationEditor: createSelector('data-testid operation-editor'),
  configEditor: createSelector('data-testid config-editor'),
};

/**
 * Mock Request Editor
 */
jest.mock('@/components/editors/RequestEditor', () => ({
  RequestEditor: ({ onChange, value }: any) => (
    <input {...inTestIds.requestEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

/**
 * Mock Nested Object Operation Editor
 */
jest.mock('./components/NestedObjectOperationEditor', () => ({
  NestedObjectOperationEditor: ({ onChange, value }: any) => (
    <input {...inTestIds.operationEditor.apply()} onChange={() => onChange(value)} />
  ),
}));

/**
 * Mock nestedObjectEditorsRegistry
 */
jest.mock('./NestedObjectEditorsRegistry', () => ({
  nestedObjectEditorsRegistry: {
    get: () => ({
      editor: ({ onChange, value }: any) => (
        <input {...inTestIds.configEditor.apply()} onChange={() => onChange(value)} />
      ),
    }),
  },
}));

/**
 * Mock Request Editor
 */
jest.mock('@/components/editors/RequestEditor');

describe('NestedObjectEditor', () => {
  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.nestedObjectEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <NestedObjectEditor value={createNestedObjectConfig({})} onChange={onChange} {...(props as any)} />;
  };

  it('Should allow to change type', () => {
    render(
      getComponent({
        value: createNestedObjectConfig({
          type: '' as never,
        }),
      })
    );

    expect(selectors.fieldType()).toBeInTheDocument();

    fireEvent.change(selectors.fieldType(), { target: { value: NestedObjectType.CARDS } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NestedObjectType.CARDS,
      })
    );
  });

  it('Should allow to change transformHelper', () => {
    const onChange = jest.fn();
    render(
      getComponent({
        value: createNestedObjectConfig({
          type: '' as never,
        }),
        onChange: onChange,
      })
    );

    expect(selectors.fieldTransformHelper()).toBeInTheDocument();

    fireEvent.change(selectors.fieldTransformHelper(), { target: { value: 'some content' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        transformHelper: 'some content',
      })
    );
  });

  it('Should allow to change transformHelper if helper value is undefined', () => {
    const onChange = jest.fn();
    render(
      getComponent({
        value: createNestedObjectConfig({
          type: '' as never,
          transformHelper: undefined,
        }),
        onChange: onChange,
      })
    );

    expect(selectors.fieldTransformHelper()).toBeInTheDocument();

    fireEvent.change(selectors.fieldTransformHelper(), { target: { value: 'some content' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        transformHelper: 'some content',
      })
    );
  });

  it('Should allow to change get request', () => {
    render(
      getComponent({
        value: createNestedObjectConfig({
          get: createTableRequestConfig({
            datasource: 'abc',
          }),
        }),
      })
    );

    expect(selectors.getRequestSectionHeader()).toBeInTheDocument();
    fireEvent.click(selectors.getRequestSectionHeader());

    expect(selectors.getRequestSectionContent()).toBeInTheDocument();
    expect(selectors.requestEditor()).toBeInTheDocument();

    fireEvent.change(selectors.requestEditor(), { target: { value: '123' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        get: createTableRequestConfig({
          datasource: 'abc',
        }),
      })
    );
  });

  describe('operations', () => {
    ['add', 'update', 'delete'].forEach((operation) => {
      it(`Should allow to enable ${operation} operation`, () => {
        render(
          getComponent({
            value: createNestedObjectConfig({
              [operation]: createNestedObjectOperationConfig({
                enabled: false,
              }),
            }),
          })
        );

        expect(selectors.operationSectionHeader(false, operation)).toBeInTheDocument();
        expect(selectors.fieldOperationEnabled(false, operation)).toBeInTheDocument();

        fireEvent.click(selectors.fieldOperationEnabled(false, operation));

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            [operation]: expect.objectContaining({
              enabled: true,
            }),
          })
        );
      });

      it(`Should allow to enable ${operation} operation if no config`, () => {
        render(
          getComponent({
            value: createNestedObjectConfig({
              [operation]: undefined,
            }),
          })
        );

        expect(selectors.operationSectionHeader(false, operation)).toBeInTheDocument();
        expect(selectors.fieldOperationEnabled(false, operation)).toBeInTheDocument();

        fireEvent.click(selectors.fieldOperationEnabled(false, operation));

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            [operation]: expect.objectContaining({
              enabled: true,
            }),
          })
        );
      });

      it(`Should allow to update ${operation} settings`, () => {
        render(
          getComponent({
            value: createNestedObjectConfig({
              [operation]: createNestedObjectOperationConfig({
                enabled: true,
              }),
            }),
          })
        );

        expect(selectors.operationSectionHeader(false, operation)).toBeInTheDocument();

        fireEvent.click(selectors.operationSectionHeader(false, operation));

        expect(selectors.operationEditor()).toBeInTheDocument();
        fireEvent.change(selectors.operationEditor(), { target: { value: '123' } });

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            [operation]: createNestedObjectOperationConfig({
              enabled: true,
            }),
          })
        );
      });
    });
  });

  it('Should allow to change editor config', () => {
    render(
      getComponent({
        value: createNestedObjectConfig({
          type: NestedObjectType.CARDS,
          editor: createNestedObjectEditorConfig({
            type: NestedObjectType.CARDS,
          }),
        }),
      })
    );

    expect(selectors.configEditor()).toBeInTheDocument();

    fireEvent.change(selectors.configEditor(), { target: { value: '123' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
        }),
      })
    );
  });
});
