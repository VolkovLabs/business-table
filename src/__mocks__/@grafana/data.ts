const actual = jest.requireActual('@grafana/data');

const standardEditorsRegistry = {
  get: () => ({
    editor: () => null,
  }),
};

module.exports = {
  ...actual,
  standardEditorsRegistry,
};
