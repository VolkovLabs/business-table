const actualRuntime = jest.requireActual('@grafana/runtime');

/**
 * Template Srv
 */
const templateSrvMock = {
  getVariables: jest.fn(),
};
const getTemplateSrv = jest.fn();

/**
 * App Events
 */
const appEventsMock = {
  publish: jest.fn(),
};

const getAppEvents = jest.fn(() => appEventsMock);

beforeEach(() => {
  getTemplateSrv.mockImplementation(() => templateSrvMock);
  getAppEvents.mockImplementation(() => appEventsMock);
});

module.exports = {
  ...actualRuntime,
  getTemplateSrv,
  locationService: {
    partial: jest.fn(),
  },
  getAppEvents,
};
