import { format } from './export';

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
