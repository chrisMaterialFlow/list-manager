//settings for the whole project
var settings = {
  backend : '/api',
  port : 8080,
  mySQL : {
    settings : {
      host : 'localhost',
      user : 'tester',
      password : 'password',
    },
    databases : [
      'accounts',
      'admin_data',
      'archives',
      'automation',
      'blog',
      'campaigns',
      'cms',
      'cms_archives',
      'cms_meta',
      'cms_products',
      'cms_users',
      'contacts',
      'customers',
      'information_schema',
      'intranet',
      'inventory',
      'mail_list',
      'materialflow',
      'mysql',
      'performance_schema',
      'sakila',
      'search',
      'seo',
      'sys',
      'test',
      'world'
    ]
  }
}

module.exports = settings;
