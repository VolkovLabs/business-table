import { format, transformNestedData } from './export';

describe('format', () => {
  it('Should format data as JSON with escaped characters when variable.name is "payload"', () => {
    const original = 'some-value';
    const variable = { name: 'payload' };
    const data = [
      ['a', 1],
      ['b', 2],
    ];

    const result = format(original, variable, data);

    const expected = JSON.stringify(data).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    expect(result).toEqual(expected);

    expect(result).toEqual('[[\\"a\\",1],[\\"b\\",2]]');
  });

  it('Should return String(original) when variable.name is not "payload"', () => {
    const original = 'some-value';
    const variable = { name: 'not-payload' };
    const data = [['a', 1]];

    const result = format(original, variable, data);

    expect(result).toEqual('some-value');
  });

  it('Should return String(original) when variable is undefined', () => {
    const original = 'some-value';
    const variable = undefined as any;
    const data = [['a', 1]];

    const result = format(original, variable, data);

    expect(result).toEqual('some-value');
  });

  it('Should return String(original) when variable is null', () => {
    const original = 'some-value';
    const variable = null as any;
    const data = [['a', 1]];

    const result = format(original, variable, data);

    expect(result).toEqual('some-value');
  });

  it('Should handle different types of original values', () => {
    const variable = { name: 'not-payload' };
    const data = [['a', 1]];

    expect(format(123, variable, data)).toEqual(123);
    expect(format(null, variable, data)).toEqual(null);
    expect(format(undefined, variable, data)).toEqual(undefined);
    expect(format('', variable, data)).toEqual('');
  });
});

describe('transformNestedData', () => {
  it('Should return empty array when data is empty', () => {
    const result = transformNestedData('{{this}}', []);
    expect(result).toEqual([]);
  });

  it('Should return formatted string using simple template', () => {
    const data = [{ id: 1, title: 'Test' }];
    const tpl = 'Hello {{this.[0].title}}';

    const result = transformNestedData(tpl, data);

    expect(result).toEqual('Hello Test');
  });

  it('Should return string with multiple items using each', () => {
    const data = [
      { id: 1, title: 'One' },
      { id: 2, title: 'Two' },
    ];
    const tpl = '{{#each this}}{{title}} {{/each}}';

    const result = transformNestedData(tpl, data);

    expect(result).toEqual('One Two ');
  });

  it('Should handle template that produces JSON', () => {
    const data = [
      { id: 1, title: 'A' },
      { id: 2, title: 'B' },
    ];
    const tpl = `
      [
        {{#each this}}
          { "id": {{id}}, "title": "{{title}}" }{{#unless @last}},{{/unless}}
        {{/each}}
      ]
    `;

    const result = transformNestedData(tpl, data);
    const parsed = JSON.parse(result as string);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toEqual({ id: 1, title: 'A' });
    expect(parsed[1]).toEqual({ id: 2, title: 'B' });
  });
});
