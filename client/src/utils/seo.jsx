import React from 'react'
import { Helmet } from 'react-helmet-async'
import { CHURCH_NAME } from './constants'

export const SEO = ({
  title,
  description,
  image,
  url
}) => {
  const fullTitle = title ? `${title} | ${CHURCH_NAME}` : CHURCH_NAME
  const defaultDescription = 'A place of worship, transformation, and divine encounter. Join us for powerful worship and life-changing messages.'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={CHURCH_NAME} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  )
}

export default SEO
