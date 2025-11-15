describe('Canvas interactions', () => {
  it('loads editor and shows palette', () => {
    cy.visit('/');
    cy.contains('Components');
    cy.contains('Card');
  });
});
