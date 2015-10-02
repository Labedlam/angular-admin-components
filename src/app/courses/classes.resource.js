angular.module( 'orderCloud' )
	.factory( 'Classes', ClassesService )
;


function ClassesService($q, Underscore) {
	var service = {
		List: _list,
		Get: _get
	};

	function _list() {
		var d = $q.defer();
		d.resolve(classes);
		return d.promise;
	}

	function _get(value) {
		var d= $q.defer();
		if (angular.isArray(value)) {
			var queue = [],
				classList = [];

			angular.forEach(value, function(classID) {
				queue.push((function() {
					var qd = $q.defer();
					_get(classID)
						.then(function(data) {
							if (data) classList.push(data);
							qd.resolve();
						});
					return qd.promise;
				})())
			});

			$q.all(queue).then(function() {d.resolve(classList)});
		} else {
			d.resolve(Underscore.where(classes, {ID: value})[0]);
		}
		return d.promise;
	}

	var classes = [
		{
			ID: 'api',
			Name: 'RESTful API',
			Description: 'What is a RESTful API?',
			TemplateUrl: 'courses/classTemplates/intro.api.tpl.html',
			Interactive: false
		},
		{
			ID: 'ordercloud',
			Name: 'OrderCloud API',
			Description: 'How does OrderCloud work?',
			TemplateUrl: 'courses/classTemplates/intro.ordercloud.tpl.html',
			ReadmeScripts: [
				"{\n\t\"Meta\": {\n\t\t\"Page\": 1,\n\t\t\"PageSize\": 20,\n\t\t\"TotalCount\": 25,\n\t\t\"TotalPages\": 2,\n\t\t\"ItemRange\": [1,20]\n\t}\n}",
				"[{\n\t\"ErrorCode\": \"FirstNameRequired\",\n\t\"Message\": \"First Name is required.\"\n},\n{\n\t\"ErrorCode\": \"LastNameRequired\",\n\t\"Message\": \"Last Name is required.\"\n}]"
			],
			Interactive: false
		},
		{
			ID: 'tools',
			Name: 'OrderCloud Development Tools',
			Description: 'What are the tools available?',
			TemplateUrl: 'courses/classTemplates/intro.tools.tpl.html',
			Interactive: false
		},
		{
			ID: 'sdk',
			Name: 'OrderCloud AngularJS SDK',
			Description: 'An in depth look at the AngularJS SDK for OrderCloud',
			TemplateUrl: 'courses/classTemplates/intro.sdk.tpl.html',
			Interactive: false,
			ReadmeScripts: [
				"\nif (response.status === 200 && response.data && response.data['access_token']) {\n\tAuth.SetToken(response.data['access_token']);\n}\n",
				"\nif (config.url.indexOf('OAuth') > -1) config.headers['Content-Type'] = 'application/x-www-form-urlencoded';\nif (Auth.GetToken()) config.headers['Authorization'] = 'Bearer ' + Auth.GetToken();\n",
				"angular.module('orderCloud', [])\n\n\t.constant('buyerid', '...') //A useful constant for using the SDK, buyerID is an extremely commmon parameter.\n\t.constant('clientid', '...') //The client ID to be used during OAuth 2 authentication\n\t.constant('ocscope', '...') //Used for defining access scope in OAuth 2 authentication\n\t.constant('authurl', '...') //The Request URL for OAuth2\n\t.constant('apiurl', '...') //The Request URL for all other API calls\n;"
			]
		},
		{
			ID: 'authentication',
			Name: 'Authentication',
			Description: 'Use the Credentials service to store your auth token',
			TemplateUrl: 'courses/classTemplates/basics.auth.tpl.html',
			Interactive: true,
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
					Title: 'create.js',
					Model: "\nvar creds = {\n\tUsername: 'mlund',\n\tPassword: 'fails345'\n};\n\nCredentials.Get(creds);",
					Disable: false,
					ListOrder: 1,
					ExecuteOrder: null,
					NextOnSuccess: true
					}
				]
			},
			Dependencies: ["Credentials","Me"],
			ClassMethods: ['Me.Get']
		},
		{
			ID: 'buyer-crud',
			Name: 'Create a Buyer',
			Description: 'Create a buyer to use in your application',
			TemplateUrl: 'courses/classTemplates/basics.create-buyer.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'Buyers.Create',
					AmountNeeded: 1
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Buyer',
						Description: 'Use this script to create your first buyer',
						Model: "\nvar buyer = {Buyers.Create};\n\nBuyers.Create(buyer);",
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'get.js',
						Name: 'Get a Buyer',
						Description: 'Use this script to get a single buyer using a search parameter',
						Model: '\nvar buyerID = "{buyerID}";\n\nBuyers.Get(buyerID);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'list.js',
						Name: 'List Buyers',
						Description: 'Use this script to access a list of buyers',
						Model: '\nBuyers.List();',
						Disable: false,
						ListOrder: 3,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'update.js',
						Name: 'Update a Buyer',
						Description: 'Use this script to fully update a buyer object',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar buyer = {Buyers.Update};\n\nBuyers.Update(buyerID, buyer);',
						Disable: false,
						ListOrder: 4,
						ExecuteOrder: null,
						NextOnSuccess: false
					}
				]
			},
			Dependencies: ["Buyers"],
			ClassMethods: ['Buyers.Create', 'Buyers.Update', 'Buyers.List', 'Buyers.Get']
		},
		{
			ID: 'group-crud',
			Name: 'Create a Group',
			Description: 'Create your first group under your new buyer company comprised of your new users',
			TemplateUrl: 'courses/classTemplates/basics.create-group.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'UserGroups.Create',
					AmountNeeded: 1
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Group',
						Description: 'Use this script to create a new group of users',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar group = {UserGroups.Create};\n\nUserGroups.Create(buyerID, group);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'get.js',
						Name: 'Get a Group',
						Description: 'Use this script to get a group of users based on a paramater',
						Model: '\nvar buyerID = "{buyerID}";\nvar groupID = "{groupID}";\n\nUserGroups.Get(buyerID, groupID);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'list.js',
						Name: 'Get a List of Groups',
						Description: 'Use this script to get a list of groups with optional query parameter',
						Model: '\nvar buyerID = "{buyerID}";\nvar search = null;\nvar page = null;\nvar pageSize = null;\n\nvar group = {UserGroups.Create};\n\nUserGroups.List(buyerID, search, page, pageSize);',
						Disable: false,
						ListOrder: 3,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'update.js',
						Name: 'Update a Group',
						Description: 'Use this script to update an entire group object',
						Model: '\nvar buyerID = "{buyerID}";\nvar groupID = "{groupID}";\n\nvar group = {UserGroups.Update};\n\nUserGroups.Update(buyerID, groupID, group);',
						Disable: false,
						ListOrder: 4,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'patch.js',
						Name: 'Partially Update a Group',
						Description: 'Use this script to update part of a group object',
						Model: '\nvar buyerID = "{buyerID}";\nvar groupID = "{groupID}";\n\nvar groupPatch = {UserGroups.Patch};\n\nUserGroups.Patch(buyerID, groupID, groupPatch);',
						Disable: false,
						ListOrder: 5,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'delete.js',
						Name: 'Delete a Group',
						Description: 'Use this to Delete an entire group using a parameter',
						Model: '\nvar buyerID = "{buyerID}";\nvar groupID = "{groupID}";\n\nUserGroups.Delete(buyerID, groupID);',
						Disable: false,
						ListOrder: 6,
						ExecuteOrder: null,
						NextOnSuccess: true
					}
				]
			},
			Dependencies: ["UserGroups"],
			ClassMethods: ['UserGroups.Create', 'UserGroups.Update', 'UserGroups.Patch']
		},
		{
			ID: 'group-assignment',
			Name: 'Create Group Assignment',
			Description: 'Create your first group assignment with your newly created group and users',
			TemplateUrl: 'courses/classTemplates/basics.create-group-assignment.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'UserGroups.SaveMemberAssignment',
					AmountNeeded: 3
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Group Assignment',
						Description: 'Use this script to create a new assignment between a user and a group',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar assignment = {UserGroups.SaveMemberAssignment};\n\nUserGroups.SaveMemberAssignment(buyerID, assignment);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'list.js',
						Name: 'List Group Asssignments',
						Description: 'Use this script to generate a list of user assignments to groups',
						Model: '\nvar buyerID = "{buyerID}";\nvar userID = null;\nvar groupID = "{groupID}";\nvar page = null;\nvar pageSize = null;\n\n\nUserGroups.ListMemberAssignments(buyerID, userID, groupID, page, pageSize);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'delete.js',
						Name: 'Delete Group Assignment',
						Description: 'Use this script to delete an existing group assignment',
						Model: '\nvar buyerID = "{buyerID}";\nvar groupID = "{groupID}";\nvar userID = "{userID}";\n\n\nUserGroups.DeleteMemberAssignment(buyerID, groupID, userID);',
						Disable: false,
						ListOrder: 3,
						ExecuteOrder: null,
						NextOnSuccess: false
					}
				]
			},
			Dependencies: ["UserGroups"],
			ClassMethods: ['UserGroups.SaveMemberAssignment', 'UserGroups.ListMemberAssignments', 'UserGroups.DeleteMemberAssignment']
		},
		{
			ID: 'api-access',
			Name: 'API Clients',
			Description: 'Create a client to receive your buyers clientID',
			TemplateUrl: 'courses/classTemplates/basics.access-claim.tpl.html',
			Interactive: true,
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
					Title: 'create.js',
					Model: '\nvar buyerID = "{buyerID}";\n\nvar claim = {ApiClients.Create};\n\nApiClients.Create(buyerID, claim);',
					Disable: false,
					ListOrder: 1,
					ExecuteOrder: null,
					NextOnSuccess: true
					}
				]
			},
			Dependencies: ["ApiClients"],
			ClassMethods: ['ApiClients.Create']
		},
		{
			ID: 'get-me',
			Name: 'Get Authenticated User',
			Description: "Use the 'Me' service to gain access to the current authenticated user information",
			TemplateUrl: 'courses/classTemplates/basics.get-me.tpl.html',
			Interactive: true,
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Model: "\n\nMe.Get();",
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					}
				]
			},
			Dependencies: ["Me"],
			ClassMethods: ['Me.Get']
		},
		{
			ID: 'user-crud',
			Name: 'Create a User',
			Description: "Create your first set of users under your new buyer",
			TemplateUrl: 'courses/classTemplates/basics.create-user.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'Users.Create',
					AmountNeeded: 3
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a User',
						Description: 'Use this script to create a new user',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar user = {Users.Create};\n\n\nUsers.Create(buyerID, user);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'get.js',
						Name: 'Get a User',
						Description: 'Use this script to get a user based on a search parameter',
						Model: '\nvar buyerID = "{buyerID}";\nvar userID = "{userID}";\n\nUsers.Get(buyerID, userID);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
                    {
                        Title: 'list.js',
						Name: 'Get a List of Users',
						Description: 'Use this script to get a list of Users with an options query parameter',
                        Model: '\nvar buyerID = "{buyerID}";\n\nUsers.List(buyerID);',
                        Disable: false,
                        ListOrder: 3,
                        ExecuteOrder: null,
                        NextOnSuccess: false
                    },
					{
						Title: 'update.js',
						Name: 'Update a User',
						Description: 'Use this script to update a full user object',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar users = {Users.Update};\n\n\nUsers.Update(buyerID, user.ID, user);',
						Disable: false,
						ListOrder: 4,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
                    {
                        Title: 'patch.js',
						Name: 'Partially Update a User',
						Description: 'Use this script to partially update a user object',
                        Model: '\nvar buyerID = "{buyerID}";\n\n//will only update Username\n\nvar user = {\n\tID: "...",\n\tUsername: "..."\n};\n\n\nUsers.Patch(buyerID, user.ID, user); ',
                        Disable: false,
                        ListOrder: 5,
                        ExecuteOrder: null,
                        NextOnSuccess: false
                    },
					{
						Title: 'delete.js',
						Name: 'Delete a User',
						Description: 'Use this script to delete a user from the system',
						Model: '\n\n var userID = "{userID}";\n\n Users.Delete(userID);',
						Disable: false,
						ListOrder: 6,
						ExecuteOrder: null,
						NextOnSuccess: false
					}
				]
			},
			Dependencies: ["Users"],
			ClassMethods: ['Users.Create', 'Users.Update']
		},
		{
			ID: 'prod-crud',
			Name: 'Create a Product',
			Description: "Create or access a product to be used to create a product and category assignment",
			TemplateUrl: 'courses/classTemplates/basics.prod-crud.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'Products.Create',
					AmountNeeded: 3
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Product',
						Description: 'Use this script to create a new product',
						Model: '\n\nvar prod = {Products.Create};\n\n\nProducts.Create(prod);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'get.js',
						Name: 'Get a Product',
						Description: 'Use this script to get a single product based on a search parameter',
						Model: '\nvar productID = "{productID}";\n\nProducts.Get(productID);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'update.js',
						Name: 'Update a Product',
						Description: 'Use this script to update an full product object',
						Model: '\n//must provide entire object in update\n\nvar prod = {Products.Create};\n\n\nProducts.Update(prod.ID, prod);',
						Disable: false,
						ListOrder: 3,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'patch.js',
						Name: 'Partially Update a Product',
						Description: 'Use this script to update a piece of an existing product object',
						Model: '\n//will only update Description\n\nvar prod = {\n\tID: "...",\n\tDescription: "..."\n};\n\n\nProducts.Patch(prod.ID, prod); ',
						Disable: false,
						ListOrder: 4,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'delete.js',
						Name: 'Delete a Product',
						Description: 'Use this script to delete an existing product from the system',
						Model: '\n\n var productID = "{productID}";\n\n Products.Delete(productID);',
						Disable: false,
						ListOrder: 5,
						ExecuteOrder: null,
						NextOnSuccess: false
					}
				]
			},
			Dependencies: ["Products"],
			ClassMethods: ['Products.Create']
		},
		{
			ID: 'price-sched-crud',
			Name: 'Create a Price Schedule',
			Description: "Create a price schedule that will be used to create a product assignment",
			TemplateUrl: 'courses/classTemplates/basics.price-sched-crud.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'PriceSchedules.Create',
					AmountNeeded: 1
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Price Schedule',
						Description: 'Use this script to create a new price schedule',
						Model: '\n\nvar ps = {PriceSchedules.Create};\n\n\nPriceSchedules.Create(ps);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'get.js',
						Name: 'Get a Price Schedule',
						Description: 'Use this script to get a single price schedule based on a search parameter',
						Model: '\n\nvar priceScheduleID = "{priceScheduleID}";\n\n\nPriceSchedules.Get(priceScheduleID);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'list.js',
						Name: 'Get a List of Price Schedules',
						Description: 'Use this script to get a list of Price Schedules based on query parameters',
						Model: '\n\n\nPriceSchedules.List();',
						Disable: false,
						ListOrder: 3,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'update.js',
						Name: 'Update a Price Schedule',
						Description: 'Use this script to update a full price schedule object',
						Model: '\n\nvar ps = {PriceSchedules.Update};\n\n\nPriceSchedules.Update(ps.ID, ps);',
						Disable: false,
						ListOrder: 4,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
                    {
                        Title: 'patch.js',
						Name: 'Partially Update a Price Schedule',
						Description: 'Use this script to partially update a price schedule object',
                        Model: '\n//will only update OrderType\n\nvar ps = {\n\tID: "...",\n\tOrderType: "..."\n};\n\n\nPriceSchedules.Patch(ps.ID, ps); ',
                        Disable: false,
                        ListOrder: 5,
                        ExecuteOrder: null,
                        NextOnSuccess: false
                    },
					{
						Title: 'delete.js',
						Name: 'Delete a Price Schedule',
						Description: 'Use this script to delete an existing price schedule from the system',
						Model: '\n\nvar priceScheduleID = "{priceScheduleID}";\n\n\nPriceSchedules.Delete(priceScheduleID);',
						Disable: false,
						ListOrder: 6,
						ExecuteOrder: null,
						NextOnSuccess: false
					}

				]
			},
			Dependencies: ["PriceSchedules"],
			ClassMethods: ['PriceSchedules.Create', 'PriceSchedules.Update', 'PriceSchedules.Patch']
		},
		{
			ID: 'prod-assignments',
			Name: 'Create Product Assignment',
			Description: "Assign your product to a user with your newly created price schedule",
			TemplateUrl: 'courses/classTemplates/basics.prod-assignments.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'Products.SaveAssignment',
					AmountNeeded: 3
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Product Assignment',
						Description: 'Use this script to create a new product assignment',
						Model: '\nvar assignment = {Products.SaveAssignment};\n\nProducts.SaveAssignment(assignment);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'list.js',
						Name: 'Get a List of Product Assignments',
						Description: 'Use this script to get a list of product assignments',
						Model: '\nvar productID = "{productID}";\nvar buyerID = null;\nvar userID = "{userID}";\nvar userGroupID = null;\nvar level = null;\nvar priceScheduleID = "{priceScheduleID}";\nvar page = null;\nvar pageSize = null;\n\n\nProducts.ListAssignments(productID, buyerID, userID, userGroupID, level, priceScheduleID, page, pageSize);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'delete.js',
						Name: 'Delete a Product Assignment',
						Description: 'Use this script to delete an existing product assignment',
						Model: '\nvar buyerID = null;\nvar productID = "{productID}";\nvar userID = "{userID}";\nvar userGroupID = null;\n\nProducts.DeleteAssignment(buyerID, productID, userID, userGroupID);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: false
					}
				]
			},
			Dependencies: ["Products"],
			ClassMethods: ['Products.SaveAssignment']
		},
		{
			ID: 'category-crud',
			Name: 'Create a Category',
			Description: "Create or access a category that you will give a user access to a product",
			TemplateUrl: 'courses/classTemplates/basics.category-crud.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'Categories.Create',
					AmountNeeded: 1
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Category',
						Description: 'Use this script to create a new category',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar cat = {Categories.Create};\n\nCategories.Create(buyerID, cat);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'get.js',
						Name: 'Get a Category',
						Description: 'Use this script to get a single existing category',
						Model: '\nvar buyerID = "{buyerID}";\nvar catID = "{categoryID}";\n\nCategories.Get(buyerID, categoryID);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'list.js',
						Name: 'Get a List of Categories',
						Description: 'Use this script to get a list of categories with optional query parameters',
						Model: '\nvar buyerID = "{buyerID}";\nvar search = null;\nvar depth = null;\nvar page = null;\nvar pageSize = null;\n\n\nCategories.List(buyerID, search, depth, page, pageSize);',
						Disable: false,
						ListOrder: 3,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'update.js',
						Name: 'Update a Category',
						Description: 'Use this script to update a full category object',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar cat = {Categories.Update};\n\n\nCategories.Update(buyerID, cat);',
						Disable: false,
						ListOrder: 4,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'patch.js',
						Name: 'Partially Update a Category',
						Description: 'Use this script to partially update an existing category',
						Model: '\n//will only update Description\n\nvar buyerID = "{buyerID}";\n\nvar cat = {\n\tID: "...",\n\tDescription: "..."\n};\n\n\nCategories.Patch(buyerID, cat); ',
						Disable: false,
						ListOrder: 5,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'delete.js',
						Name: 'Delete a Category',
						Description: 'Use this script to delete an existing category',
						Model: '\nvar buyerID = "{buyerID}";\nvar categoryID = "{categoryID}";\n\n Categories.Delete(buyerID, categoryID);',
						Disable: false,
						ListOrder: 6,
						ExecuteOrder: null,
						NextOnSuccess: false
					}
				]
			},
			Dependencies: ["Categories"],
			ClassMethods: ['Categories.Create', 'Categories.Update']
		},
		{
			ID: 'category-prod-assignment',
			Name: 'Create Category Product Assignment',
			Description: "Assign your category to a product",
			TemplateUrl: 'courses/classTemplates/basics.category-prod-assignment.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'Categories.SaveProductAssignments',
					AmountNeeded: 3
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Category Product Assignment',
						Description: 'Use this script to create a category product assignment',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar assignment = {Categories.SaveProductAssignments}\n\nCategories.SaveProductAssignments(buyerID, assignment);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'list.js',
						Name: 'Get a List of Category Product Assignments',
						Description: 'Use this script to get a list of category product assignments',
						Model: '\nvar buyerID = "{buyerID}";\nvar categoryID = "{categoryID}";\nvar productID = "{productID}";\nvar page = null;\nvar pageSize = null;\n\nCategories.ListProductAssignments(buyerID, categoryID, productID, page, pageSize);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'delete.js',
						Name: 'Delete a Category Product Assignment',
						Description: 'Use this script to delete a category product assignment',
						Model: '\nvar buyerID = "{buyerID}";\nvar categoryID = "{categoryID}";\nvar productID = "{productID}";\n\nCategories.DeleteProductAssignments(buyerID, categoryID, productID);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: false
					}
				]
			},
			Dependencies: ["Categories"],
			ClassMethods: ['Categories.SaveProductAssignments']
		},
		{
			ID: 'category-assignment',
			Name: 'Create Category Assignment',
			Description: "Assign your category to a user",
			TemplateUrl: 'courses/classTemplates/basics.category-assignment.tpl.html',
			Interactive: true,
			Assert: [
				{
					Method: 'Categories.SaveAssignment',
					AmountNeeded: 1
				}
			],
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'create.js',
						Name: 'Create a Category Assignment',
						Description: 'Use this script to assign a group to a category',
						Model: '\nvar buyerID = "{buyerID}";\n\nvar assignment = {Categories.SaveAssignment}\n\nCategories.SaveAssignment(buyerID, assignment);',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					},
					{
						Title: 'list.js',
						Name: 'Get a list of Category Assignments',
						Description: 'Use this script to get a list of user/group assignments to a category',
						Model: '\nvar buyerID = "{buyerID}";\nvar categoryID = "{categoryID}";\nvar userID = "{userID}";\nvar userGroupID = null;\nvar level = null;\nvar page = null;\nvar pageSize = null;\n\nCategories.ListAssignments(buyerID, categoryID, userID, userGroupID, level, page, pageSize);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: false
					},
					{
						Title: 'delete.js',
						Name: 'Delete a Category Assignment',
						Description: 'Use this script to delete a category assignment',
						Model: '\nvar buyerID = "{buyerID}";\nvar categoryID = "{categoryID}";\nvar userID = "{userID}";\nvar userGroupID = null;\n\nCategories.DeleteProductAssignments(buyerID, categoryID, userID, userGroupID);',
						Disable: false,
						ListOrder: 2,
						ExecuteOrder: null,
						NextOnSuccess: false
					}
				]
			},
			Dependencies: ["Categories"],
			ClassMethods: ['Categories.SaveAssignment']
		},
		{
			ID: 'get-products-as-user',
			Name: 'Get User Products',
			Description: "Authenticate as a user",
			TemplateUrl: 'courses/classTemplates/user-prod-access.get-product-as-user.tpl.html',
			Interactive: true,
			ScriptModels: {
				Meta: {
					ExecuteAll: false
				},
				Scripts: [
					{
						Title: 'get.js',
						Model: '\nMe.ListProducts();',
						Disable: false,
						ListOrder: 1,
						ExecuteOrder: null,
						NextOnSuccess: true
					}
				]
			},
			Dependencies: ["Me"],
			ClassMethods: ["Me.Products"]
		}

	];

	return service;
}