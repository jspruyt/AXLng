import { AxlngAppPage } from './app.po';

describe('axlng-app App', () => {
  let page: AxlngAppPage;

  beforeEach(() => {
    page = new AxlngAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
