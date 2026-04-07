export function getResolvedNavItems(navItems = []) {
  return navItems.map((item, index) => {
    if (typeof item === 'string') {
      return item
    }

    if (index === 1 && (item.href ?? '/') === '/') {
      return {
        ...item,
        href: '/?breaking=1',
      }
    }

    if (index === 2 && (item.href ?? '/') === '/') {
      return {
        ...item,
        href: '/?explainer=1',
      }
    }

    return item
  })
}
