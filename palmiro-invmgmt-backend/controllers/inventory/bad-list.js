const badList = async (req, res) => {
  // const aggregateQuery = [
  //   // Match documents
  //   {
  //     $match: {
  //       "items.serial_numbers.bad_condition": true,
  //     },
  //   },
  //   {
  //     $addFields: {
  //       items: {
  //         $filter: {
  //           input: {
  //             $map: {
  //               input: "$items",
  //               as: "itemsArray",
  //               in: {
  //                 name: "$$itemsArray.name",
  //                 serial_numbers: {
  //                   $filter: {
  //                     input: "$$itemsArray.serial_numbers",
  //                     as: "snosArray",
  //                     cond: {
  //                       $and: [{ $eq: ["$$snosArray.bad_condition", true] }],
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           as: "itemsArray",
  //           cond: {
  //             $and: [{ $gt: [{ $size: "$$itemsArray.serial_numbers" }, 0] }],
  //           },
  //         },
  //       },
  //     },
  //   },
  // ];

  const aggregateQuery = [
    {
      $match: {
        condition: "bad",
      },
    },
    {
      $lookup: {
        from: "partcodes",
        localField: "part_code",
        foreignField: "_id",
        as: "partcode",
      },
    },
    {
      $unwind: "$partcode",
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "warehouse",
        foreignField: "_id",
        as: "warehouse",
      },
    },
    {
      $unwind: "$warehouse",
    },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: "$brand",
    },
    {
      $lookup: {
        from: "orders",
        localField: "purchase_order",
        foreignField: "_id",
        as: "purchase_order",
      },
    },
    {
      $unwind: "$purchase_order",
    },
    {
      $lookup: {
        from: "orders",
        localField: "sale_order",
        foreignField: "_id",
        as: "sale_order",
      },
    },
    {
      $unwind: {
        path: "$sale_order",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "sale_order_returned",
        foreignField: "_id",
        as: "sale_order_returned",
      },
    },
    {
      $unwind: {
        path: "$sale_order_returned",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: { created_at: 1 } },
  ];

  const [r_err, records] = await wait(_models.Inventory.aggregate, _models.Inventory, aggregateQuery);

  if (r_err) {
    return res.error(r_err);
  }

  return res.success(records);
};

module.exports = badList;
