export const getId = (item) => item?._id || item?.id || "";

export const getImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (typeof image === "object") return image.url || image.secure_url || "";
  return "";
};

export const normalizeImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map(getImageUrl).filter(Boolean);
  }

  const singleImage = getImageUrl(images);
  return singleImage ? [singleImage] : [];
};

export const normalizeSizes = (sizes) => {
  if (!sizes) return {};

  if (Array.isArray(sizes)) {
    return sizes.reduce((acc, item) => {
      if (item?.size) {
        acc[item.size] = Number(item.quantity ?? 0);
      }
      return acc;
    }, {});
  }

  if (typeof sizes === "object") {
    return Object.entries(sizes).reduce((acc, [size, quantity]) => {
      acc[size] = Number(quantity ?? 0);
      return acc;
    }, {});
  }

  return {};
};

export const getSizeTotal = (sizes) =>
  Object.values(normalizeSizes(sizes)).reduce(
    (sum, quantity) => sum + Number(quantity || 0),
    0,
  );

export const getProductPrice = (product) =>
  Number(product?.listedPrice ?? product?.price ?? 0);

export const normalizeCategory = (category) => {
  if (!category) return null;
  if (typeof category === "string") {
    return {
      _id: category,
      id: category,
      name: category,
      productType: "",
      group: "",
    };
  }

  return {
    ...category,
    _id: category?._id || category?.id || "",
    id: category?._id || category?.id || "",
    name: category?.name || "",
    productType: category?.productType || "",
    group: category?.group || "",
  };
};

export const normalizeProduct = (product, categoryOverride = null) => {
  const category = normalizeCategory(categoryOverride || product?.category);
  const id = getId(product);
  const images = normalizeImages(
    product?.images || (product?.image ? [product.image] : []),
  );
  const image = images[0] || getImageUrl(product?.image) || "";
  const sizes = normalizeSizes(product?.sizes);
  const stock = Number(
    product?.stock ??
      getSizeTotal(product?.sizes) ??
      product?.totalQuantity ??
      0,
  );

  return {
    ...product,
    _id: id,
    id,
    name: product?.name || "",
    description: product?.description || "",
    listedPrice: getProductPrice(product),
    price: getProductPrice(product),
    stock,
    totalQuantity: Number(product?.totalQuantity ?? stock),
    sizes,
    images,
    image,
    category,
    productType: product?.productType || category?.productType || "",
    group: product?.group || category?.group || "",
    isActive: product?.isActive !== false,
  };
};

export const buildProductPayload = ({
  name,
  price,
  description,
  category,
  productType,
  group,
  isActive,
  sizes,
  image,
}) => ({
  name,
  listedPrice: Number(price || 0),
  description,
  category,
  productType,
  group,
  sizes: Object.entries(sizes || {})
    .filter(([, quantity]) => quantity !== undefined)
    .map(([size, quantity]) => ({ size, quantity: Number(quantity || 0) })),
  isActive,
  image: image || "",
});

export const normalizeLead = (lead) => {
  const productRef = lead?.product;
  const productName =
    lead?.productName ||
    (typeof productRef === "object" ? productRef?.name : "") ||
    "";

  return {
    ...lead,
    _id: getId(lead),
    id: getId(lead),
    name: lead?.customerName || lead?.name || "",
    phone: lead?.customerPhone || lead?.phone || "",
    product: productName,
    productName,
    source: lead?.source || "",
    date: lead?.createdAt || lead?.date || "",
    status: lead?.status || "New",
  };
};

export const normalizeOrder = (order) => {
  const productRef = order?.product;
  const productName =
    typeof productRef === "object"
      ? productRef?.name
      : order?.productName || "";
  const quantity = Number(order?.quantity || 1);
  const unitPrice = Number(
    order?.agreedPrice ?? order?.listedPrice ?? order?.total ?? 0,
  );

  return {
    ...order,
    _id: getId(order),
    id: getId(order),
    customerName: order?.customerName || order?.customer?.name || "",
    customerPhone: order?.customerPhone || order?.customer?.phone || "",
    customerEmail: order?.customerEmail || order?.customer?.email || "",
    productName,
    totalAmount: Number(
      order?.totalAmount ?? order?.total ?? unitPrice * quantity,
    ),
    total: Number(order?.totalAmount ?? order?.total ?? unitPrice * quantity),
    quantity,
    status: order?.status || "",
    items: order?.items?.length
      ? order?.items
      : [
          {
            name: productName || "Product",
            size: order?.size || "",
            quantity,
            price: unitPrice,
          },
        ],
  };
};
