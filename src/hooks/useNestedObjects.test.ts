import { toDataFrame } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { act, renderHook } from '@testing-library/react';
import { useDatasourceRequest } from '@volkovlabs/components';

import { CellType } from '@/types';
import { createColumnConfig, createNestedObjectConfig, createNestedObjectEditorConfig } from '@/utils';

import { useNestedObjects } from './useNestedObjects';

describe('useNestedObjects', () => {
  const replaceVariables = jest.fn();
  const datasourceRequestMock = jest.fn();

  beforeEach(() => {
    jest.mocked(useDatasourceRequest).mockReturnValue(datasourceRequestMock);
  });

  it('Should load nested data', async () => {
    const object = createNestedObjectConfig({
      id: '123',
      editor: createNestedObjectEditorConfig({
        id: 'myId',
      }),
    });

    const column = createColumnConfig({
      field: {
        name: 'comments',
        source: '',
      },
      type: CellType.NESTED_OBJECTS,
      objectId: object.id,
    });

    const data = [
      {
        [column.field.name]: [1, 2],
      },
      {
        [column.field.name]: [],
      },
      {
        [column.field.name]: 1,
      },
    ];

    /**
     * Mock objects result
     */
    datasourceRequestMock.mockResolvedValue({
      data: [
        toDataFrame({
          fields: [
            {
              name: object.editor.id,
              values: [1, 2],
            },
          ],
        }),
      ],
    });

    const { result } = renderHook(() =>
      useNestedObjects({
        replaceVariables,
        objects: [object],
      })
    );

    expect(result.current.getValuesForColumn(column.objectId)).toBeUndefined();

    await act(async () => result.current.onLoad(column, data));

    const nestedData = result.current.getValuesForColumn(column.objectId);

    expect(nestedData.get(1)).toEqual({
      [object.editor.id]: 1,
    });
    expect(nestedData.get(2)).toEqual({
      [object.editor.id]: 2,
    });
  });

  it('Should work if object not found', async () => {
    const column = createColumnConfig({
      field: {
        name: 'comments',
        source: '',
      },
      type: CellType.NESTED_OBJECTS,
      objectId: 'unknown',
    });

    const { result } = renderHook(() =>
      useNestedObjects({
        replaceVariables,
        objects: [],
      })
    );

    expect(result.current.getValuesForColumn(column.objectId)).toBeUndefined();

    await act(async () => result.current.onLoad(column, []));

    expect(result.current.getValuesForColumn(column.objectId)).toBeUndefined();
  });

  it('Should notify error with error message if request invalid', async () => {
    const object = createNestedObjectConfig({
      id: '123',
      editor: createNestedObjectEditorConfig({
        id: 'myId',
      }),
    });

    const column = createColumnConfig({
      field: {
        name: 'comments',
        source: '',
      },
      type: CellType.NESTED_OBJECTS,
      objectId: object.id,
    });

    const data = [
      {
        [column.field.name]: [1, 2],
      },
    ];

    /**
     * Mock objects result
     */
    datasourceRequestMock.mockRejectedValue(new Error('response error'));

    const { result } = renderHook(() =>
      useNestedObjects({
        replaceVariables,
        objects: [object],
      })
    );

    await act(async () => result.current.onLoad(column, data));

    expect(getAppEvents().publish).toHaveBeenCalledWith({
      payload: ['Error', 'response error'],
      type: 'alert-error',
    });
  });

  it('Should notify error with "Unknown Error" text if request invalid', async () => {
    const object = createNestedObjectConfig({
      id: '123',
      editor: createNestedObjectEditorConfig({
        id: 'myId',
      }),
    });

    const column = createColumnConfig({
      field: {
        name: 'comments',
        source: '',
      },
      type: CellType.NESTED_OBJECTS,
      objectId: object.id,
    });

    const data = [
      {
        [column.field.name]: [1, 2],
      },
    ];

    /**
     * Mock objects result
     */
    datasourceRequestMock.mockRejectedValue('response error');

    const { result } = renderHook(() =>
      useNestedObjects({
        replaceVariables,
        objects: [object],
      })
    );

    await act(async () => result.current.onLoad(column, data));

    expect(getAppEvents().publish).toHaveBeenCalledWith({
      payload: ['Error', 'Unknown Error'],
      type: 'alert-error',
    });
  });

  it('Should work if Ids is empty', async () => {
    const object = createNestedObjectConfig({
      id: '123',
      editor: createNestedObjectEditorConfig({
        id: 'myId',
      }),
    });

    const column = createColumnConfig({
      field: {
        name: 'comments',
        source: '',
      },
      type: CellType.NESTED_OBJECTS,
      objectId: object.id,
    });

    const data = [
      {
        [column.field.name]: [],
      },
    ];

    /**
     * Mock objects result
     */
    datasourceRequestMock.mockRejectedValue('response error');

    const { result } = renderHook(() =>
      useNestedObjects({
        replaceVariables,
        objects: [object],
      })
    );

    expect(result.current.getValuesForColumn(column.objectId)).toBeUndefined();

    await act(async () => result.current.onLoad(column, data));

    expect(result.current.getValuesForColumn(column.objectId)).toBeUndefined();
  });
});
