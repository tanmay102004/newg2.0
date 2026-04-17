const FIXED_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/newgindia',
  instagram: 'https://www.instagram.com/newgindia/',
  x: 'https://x.com/newgindia',
  youtube: 'https://www.youtube.com/channel/UClewPH3Ej8VNsJvH_FT0yyQ',
}

export function resolveFixedSocialHref(item) {
  const typeKey = item?.type?.toLowerCase?.()
  const iconKey = item?.icon?.toLowerCase?.()
  const labelKey = item?.label?.toLowerCase?.()

  if (typeKey && FIXED_SOCIAL_LINKS[typeKey]) {
    return FIXED_SOCIAL_LINKS[typeKey]
  }

  if (iconKey && FIXED_SOCIAL_LINKS[iconKey]) {
    return FIXED_SOCIAL_LINKS[iconKey]
  }

  if (labelKey) {
    if (labelKey.includes('facebook')) return FIXED_SOCIAL_LINKS.facebook
    if (labelKey.includes('instagram')) return FIXED_SOCIAL_LINKS.instagram
    if (labelKey === 'x' || labelKey.includes('twitter')) return FIXED_SOCIAL_LINKS.x
    if (labelKey.includes('youtube') || labelKey.includes('yt')) return FIXED_SOCIAL_LINKS.youtube
  }

  return item?.href ?? '/'
}

export { FIXED_SOCIAL_LINKS }
