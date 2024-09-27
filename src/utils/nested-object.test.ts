import { toDataFrame } from '@grafana/data';

import { NestedObjectType } from '@/types';
import { createNestedObjectConfig, createNestedObjectEditorConfig } from '@/utils';

import { getNestedObjectEditorConfig, NestedObjectCardMapper, prepareFrameForNestedObject } from './nested-object';

describe('Nested Object Utils', () => {
  describe('getNestedObjectEditorConfig', () => {
    it('Should return editor config', () => {
      expect(getNestedObjectEditorConfig(NestedObjectType.CARDS)).toEqual(
        createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
        })
      );
    });
  });

  describe('prepareFrameForNestedObject', () => {
    const data = toDataFrame({
      fields: [
        {
          name: 'id',
          values: [1, 2, 3],
        },
        {
          name: 'idString',
          values: ['a', 'b', 'c'],
        },
        {
          name: 'value',
          values: [10, 20, 30],
        },
      ],
    });

    it('Should convert rows to objects map by number keys', () => {
      const object = createNestedObjectConfig({
        id: 'byId',
        editor: createNestedObjectEditorConfig({
          id: 'id',
        }),
      });

      const result = prepareFrameForNestedObject(object, data);

      expect(result.get(1)).toEqual({
        id: 1,
        idString: 'a',
        value: 10,
      });
      expect(result.get(2)).toEqual({
        id: 2,
        idString: 'b',
        value: 20,
      });
    });

    it('Should convert rows to objects map by string keys', () => {
      const object = createNestedObjectConfig({
        id: 'byId',
        editor: createNestedObjectEditorConfig({
          id: 'idString',
        }),
      });

      const result = prepareFrameForNestedObject(object, data);

      expect(result.get('a')).toEqual({
        id: 1,
        idString: 'a',
        value: 10,
      });
      expect(result.get('b')).toEqual({
        id: 2,
        idString: 'b',
        value: 20,
      });
    });

    it('Should convert rows to objects map by default key', () => {
      const object = createNestedObjectConfig({
        id: 'byId',
        editor: createNestedObjectEditorConfig({
          id: '',
        }),
      });

      const result = prepareFrameForNestedObject(object, data);

      expect(result.get(1)).toEqual({
        id: 1,
        idString: 'a',
        value: 10,
      });
      expect(result.get(2)).toEqual({
        id: 2,
        idString: 'b',
        value: 20,
      });
    });
  });

  describe('NestedObjectCardMapper', () => {
    /**
     * Config
     */
    const config = createNestedObjectEditorConfig({
      type: NestedObjectType.CARDS,
      id: 'myId',
      title: 'myTitle',
      time: 'myTime',
      author: 'myAuthor',
      body: 'myBody',
    });

    /**
     * Instance
     */
    const instance = new NestedObjectCardMapper(config);

    /**
     * Create Item
     */
    type ItemKeys = 'myId' | 'myTitle' | 'myTime' | 'myAuthor' | 'myBody';
    const createItem = (item: Partial<Record<ItemKeys, unknown>>) => ({
      [config.id]: 0,
      [config.title]: '',
      [config.body]: '',
      [config.time]: '',
      [config.author]: '',
      ...item,
    });

    it('Should return id', () => {
      expect(instance.getId(createItem({ myId: 1 }))).toEqual(1);
      expect(instance.getId(createItem({ myId: 'hello' }))).toEqual('hello');
    });

    it('Should return title', () => {
      expect(instance.getTitle(createItem({ myTitle: 'hello' }))).toEqual('hello');
      expect(instance.getTitle(createItem({ myTitle: 123 }))).toEqual('');
    });

    it('Should return body', () => {
      expect(instance.getBody(createItem({ myBody: 'hello' }))).toEqual('hello');
      expect(instance.getBody(createItem({ myBody: 123 }))).toEqual('');
    });

    it('Should return author', () => {
      expect(instance.getAuthor(createItem({ myAuthor: 'hello' }))).toEqual('hello');
      expect(instance.getAuthor(createItem({ myAuthor: 123 }))).toEqual(123);
    });

    it('Should return string date', () => {
      const value = new Date().toISOString();
      expect(instance.getTime(createItem({ myTime: value }))).toEqual(value);
      expect(instance.getTime(createItem({ myTime: 'invalid' }))).toEqual('');
    });

    it('Should return timestamp', () => {
      const value = new Date().valueOf();

      expect(instance.getTime(createItem({ myTime: value }))).toEqual(value);
      expect(instance.getTime(createItem({ myTime: NaN }))).toEqual('');
    });

    it('Should convert item to payload', () => {
      const dateString = new Date().toISOString();

      expect(
        instance.getPayload(
          createItem({
            myId: '1',
            myTitle: 'hello',
            myBody: 'body123',
            myAuthor: 'author123',
            myTime: dateString,
          })
        )
      ).toEqual({
        id: '1',
        title: 'hello',
        body: 'body123',
        author: 'author123',
        time: dateString,
      });
    });

    it('Should add only configured fields in payload', () => {
      const instance = new NestedObjectCardMapper(
        createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
        })
      );

      expect(instance.getPayload({})).toEqual({});
    });

    it('Should convert payload to object', () => {
      expect(
        instance.createObject({
          id: 'id1',
          body: 'body1',
          title: 'title1',
          author: 'author1',
          time: 'time1',
        })
      ).toEqual({
        myAuthor: 'author1',
        myBody: 'body1',
        myId: 'id1',
        myTime: 'time1',
        myTitle: 'title1',
      });

      expect(
        instance.createObject({
          id: 'id1',
          title: 'title1',
        })
      ).toEqual({
        myId: 'id1',
        myTitle: 'title1',
      });
    });

    it('Should create new payload', () => {
      expect(instance.createNewPayload()).toEqual({
        body: '',
        title: '',
      });

      /**
       * Create Instance Without Fields
       */
      const newInstance = new NestedObjectCardMapper(
        createNestedObjectEditorConfig({
          type: NestedObjectType.CARDS,
        })
      );
      expect(newInstance.createNewPayload()).toEqual({});
    });
  });
});
