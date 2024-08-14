const actual = jest.requireActual('@grafana/runtime');

/**
 * Template Srv
 */
const templateSrvMock = {
  getVariables: jest.fn(),
};
const getTemplateSrv = jest.fn();

beforeEach(() => {
  getTemplateSrv.mockImplementation(() => templateSrvMock);
});

module.exports = {
  ...actual,
  getTemplateSrv,
};
