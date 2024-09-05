const actualData = jest.requireActual('@grafana/data');

const standardEditorsRegistry = {
  get: () => ({
    editor: () => null,
  }),
};

module.exports = {
  ...actualData,
  standardEditorsRegistry,
};
