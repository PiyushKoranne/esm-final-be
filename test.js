const { SitemapStream, streamToPromise } = require( 'sitemap' );
  const { Readable } = require( 'stream' );
  const fs = require('fs');

  // An array with your links
  const links = [{
	url: '/',
	priority: 0.8,
  },
  {
	url: '/about-us',
	priority: 0.7,
  },
  {
	url: '/careers',
	priority: 0.7,
  },
  {
	url: '/contact-us',
	priority: 0.7,
  },
  {
	url: '/life-at-conative',
	priority: 0.7,
  },
  {
	url: '/team',
	priority: 0.7,
  },
  {
	url: '/team',
	priority: 0.7,
  },
  {
	url: '/testimonial',
	priority: 0.7,
  },
  {
	url: '/website-design-development-services',
	priority: 0.7,
  },
  {
	url: '/mobile-app-development-services',
	priority: 0.7,
  },
  {
	url: '/ecommerce-development-services',
	priority: 0.7,
  },
  {
	url: '/animation-services',
	priority: 0.7,
  },
  {
	url: '/graphic-design-services',
	priority: 0.7,
  },
  {
	url: '/digital-marketing-services',
	priority: 0.7,
  },
  {
	url: '/website-portfolio',
	priority: 0.7,
  },
  {
	url: '/website-portfolio/wordpress',
	priority: 0.7,
  },
  {
	url: '/website-portfolio/laravel',
	priority: 0.7,
  },
  {
	url: '/website-portfolio/shopify',
	priority: 0.7,
  },
  {
	url: '/website-portfolio/codeigniter',
	priority: 0.7,
  },
  {
	url: '/website-portfolio/react',
	priority: 0.7,
  },
  {
	url: '/graphic-portfolio',
	priority: 0.7,
  },
  {
	url: '/graphic-portfolio/logo-design',
	priority: 0.7,
  },
  {
	url: '/graphic-portfolio/flyer-pamphlet-design',
	priority: 0.7,
  },
  {
	url: '/graphic-portfolio/brochure-design',
	priority: 0.7,
  },
  {
	url: '/graphic-portfolio/business-card-design',
	priority: 0.7,
  },
  {
	url: '/graphic-portfolio/tshirt-design',
	priority: 0.7,
  },
  {
	url: '/graphic-portfolio/brand-identity-design',
	priority: 0.7,
  },
  {
	url: '/website-design-development-portfolio',
	priority: 0.7,
  },
  {
	url: '/graphic-design-portfolio',
	priority: 0.7,
  },
  {
	url: '/graphic-portfolio/social-media-design',
	priority: 0.7,
  }]

  // Create a stream to write to
  const stream = new SitemapStream( { hostname: 'https://conativeitsolutions.com/' } )

  // Return a promise that resolves with your XML string
  function a () {
		return streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
		data.toString()
	)
  }

  a().then(data => {
	console.log(data)
	fs.writeFileSync('./public/sitemap.xml',data)
  })