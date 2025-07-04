/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "name": "orders",
    "type": "base",
    "system": false,
    "id": "pbc_orders",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "listRule": null,
    "viewRule": null,
    "indexes": [],
    "fields": [
      {
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": false,
        "system": false,
        "hidden": false
      },
      {
        "name": "address",
        "type": "text",
        "required": true,
        "presentable": false,
        "system": false,
        "hidden": false
      },
      {
        "name": "phone",
        "type": "text",
        "required": true,
        "presentable": false,
        "system": false,
        "hidden": false
      },
      {
        "name": "items",
        "type": "json",
        "required": true,
        "presentable": false,
        "system": false,
        "hidden": false
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "presentable": false,
        "system": false,
        "hidden": false,
        "max": null,
        "min": null,
        "onlyInt": false
      },
      {
        "name": "created",
        "type": "autodate",
        "required": false,
        "presentable": false,
        "system": false,
        "hidden": false,
        "onCreate": true,
        "onUpdate": false
      }
    ]
  })
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_orders")
  return app.delete(collection)
})
