import React, { useState, useEffect, useRef } from "react";
import Cart from "./Cart";
import "../styles/Products.css";
import halal from "../images/halal_png.png";
import { useSwipeable } from "react-swipeable";
import "../styles/OrderPage.css";
import LazyImage from "./LazyImage";
import jpgPlaceholder from "../images/cat.jpg";
import { useNavigate } from "react-router-dom";

function Products() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pizzaSize, setPizzaSize] = useState(null);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [modalPosition, setModalPosition] = useState(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [isOrderSection, setIsOrderSection] = useState(false);
  const [orderDetails, setOrderDetails] = useState({ name: "", phone: "", comments: "" });
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: "",
    phone: "",
    address: "",
    comments: "",
  });
  const [isOrderSent, setIsOrderSent] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(() => {
    return localStorage.getItem("selectedBranch") || null;
  });
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(!localStorage.getItem("selectedBranch"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const modalRef = useRef(null);
  const menuRef = useRef(null);
  const sectionRefs = useRef({});
  const navigate = useNavigate();
  const baseURL = "https://nukesul-brepb-651f.twc1.net";

  const categoryEmojis = {
    Пиццы: "🍕",
    Половинка_Пиццы: "🍕",
    Комбо: "🍕🍔🍟",
    Сет: "🍱",
    Бургеры: "🍔",
    Шаурмы: "🌯",
    Суши: "🍣",
    Плов: "🍚",
    Десерты: "🍰",
    Блинчики: "🥞",
    Закуски: "🍟",
    Восточная_кухня: "🥘",
    Европейская_кухня: "🍝",
    Стейки_и_горячие_блюда: "🥩🔥",
    Горячие_блюда: "🍲",
    Супы: "🥣",
    Манты: "🥟",
    Вок: "🍜",
    Гарниры: "🍟",
    Закуски_и_гарниры: "🍢",
    Завтраки: "🥞",
    Детское_меню: "👶🍴",
    Шашлыки: "🥩",
    Салаты: "🥗",
    Соусы: "🥫",
    Хлеб: "🥖",
    Горячие_напитки: "☕",
    Напитки: "🍹",
    Лимонады: "🍋",
    Коктейли: "🍸",
    Бабл_ти: "🧋",
    Кофе: "☕",
  };

  const priority = [
    "Пиццы",
    "Половинка_Пиццы",
    "Комбо",
    "Сет",
    "Бургеры",
    "Шаурмы",
    "Суши",
    "Плов",
    "Десерты",
    "Блинчики",
    "Закуски",
    "Восточная_кухня",
    "Европейская_кухня",
    "Стейки_и_горячие_блюда",
    "Горячие_блюда",
    "Супы",
    "Манты",
    "Вок",
    "Гарниры",
    "Закуски_и_гарниры",
    "Завтраки",
    "Детское_меню",
    "Салаты",
    "Соусы",
    "Хлеб",
    "Горячие_напитки",
    "Напитки",
    "Лимонады",
    "Коктейли",
    "Бабл_ти",
    "Кофе",
  ];

  const fetchBranches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseURL}/api/public/branches`);
      if (!response.ok) {
        throw new Error("Ошибка при загрузке филиалов");
      }
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Неверный формат данных филиалов");
      }

      setBranches(data);

      if (data.length === 0) {
        setError("Филиалы не найдены");
        setIsBranchModalOpen(true);
        return;
      }

      if (selectedBranch && !data.some(branch => branch.id === parseInt(selectedBranch))) {
        setSelectedBranch(null);
        localStorage.removeItem("selectedBranch");
        setIsBranchModalOpen(true);
      }

      if (!selectedBranch) {
        setIsBranchModalOpen(true);
      }
    } catch (error) {
      console.error("Ошибка при загрузке филиалов:", error);
      setError("Не удалось загрузить филиалы: " + error.message);
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedBranch) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${baseURL}/api/public/branches/${selectedBranch}/products`);
        if (!response.ok) {
          throw new Error("Ошибка при загрузке продуктов");
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Неверный формат данных продуктов");
        }

        setProducts(data);
        const groupedItems = data.reduce((acc, product) => {
          acc[product.category] = acc[product.category] || [];
          acc[product.category].push(product);
          return acc;
        }, {});

        const sortedCategories = Object.fromEntries(
          Object.entries(groupedItems).sort(([catA], [catB]) => {
            const indexA = priority.indexOf(catA);
            const indexB = priority.indexOf(catB);
            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
          })
        );

        setMenuItems(sortedCategories);
      } catch (error) {
        console.error("Ошибка при загрузке продуктов:", error);
        setError("Не удалось загрузить продукты: " + error.message);
        setProducts([]);
        setMenuItems({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, [selectedBranch]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let currentCategory = "";
      Object.keys(sectionRefs.current).forEach((category) => {
        const section = sectionRefs.current[category];
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentCategory = category;
          }
        }
      });
      if (currentCategory && currentCategory !== activeCategory) {
        setActiveCategory(currentCategory);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCategory]);

  useEffect(() => {
    if (!menuRef.current || !activeCategory) return;
    const activeItem = menuRef.current.querySelector(`a[href="#${activeCategory}"]`);
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeCategory]);

  useEffect(() => {
    if (isProductModalOpen) {
      setIsModalClosing(false);
    }
  }, [isProductModalOpen]);

  const handleCartOpen = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);

  const handleProductClick = (product, category) => {
    setSelectedProduct({ product, category });
    if (category !== "Пиццы") setPizzaSize(null);
    setIsProductModalOpen(true);
  };

  const isPizza = (product) => {
    return product && product.price_small && product.price_medium && product.price_large;
  };

  const handleAddToCart = () => {
    try {
      if (!selectedProduct?.product) return;

      if (isPizza(selectedProduct.product) && !pizzaSize) {
        throw new Error("Выберите размер пиццы перед добавлением в корзину.");
      }

      const itemToAdd = {
        id: isPizza(selectedProduct.product)
          ? `${selectedProduct.product.id}-${pizzaSize}`
          : selectedProduct.product.id,
        name: isPizza(selectedProduct.product)
          ? `${selectedProduct.product.name} (${pizzaSize})`
          : selectedProduct.product.name,
        price:
          isPizza(selectedProduct.product) && pizzaSize
            ? selectedProduct.product[`price_${pizzaSize.toLowerCase()}`]
            : selectedProduct.product.price,
        quantity: 1,
        image: selectedProduct.product.image_url,
      };

      const existingItemIndex = cartItems.findIndex((item) => item.id === itemToAdd.id);

      if (existingItemIndex > -1) {
        const updatedCartItems = cartItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCartItems(updatedCartItems);
      } else {
        setCartItems([...cartItems, itemToAdd]);
      }

      closeProductModal();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleQuantityChange = (itemId, change) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePromoCodeSubmit = async () => {
    try {
      const response = await fetch(`${baseURL}/api/validate-promo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка проверки промокода");
      }
      const data = await response.json();
      setDiscount(data.discount);
      alert(`Промокод применен! Скидка ${data.discount}% добавлена.`);
    } catch (error) {
      console.error("Ошибка проверки промокода:", error);
      alert(error.message || "Ошибка проверки промокода.");
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?\d{10,12}$/;
    return phoneRegex.test(phone);
  };

  const validateFields = () => {
    const errors = {};
    if (isOrderSection) {
      if (!orderDetails.name) errors.name = "Пожалуйста, заполните имя";
      if (!orderDetails.phone) errors.phone = "Пожалуйста, заполните телефон";
      else if (!validatePhone(orderDetails.phone))
        errors.phone = "Неверный формат телефона (например, +996123456789)";
    } else {
      if (!deliveryDetails.name) errors.name = "Пожалуйста, заполните имя";
      if (!deliveryDetails.phone) errors.phone = "Пожалуйста, заполните телефон";
      else if (!validatePhone(deliveryDetails.phone))
        errors.phone = "Неверный формат телефона (например, +996123456789)";
      if (!deliveryDetails.address) errors.address = "Пожалуйста, заполните адрес";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const sendOrderToServer = async () => {
    if (cartItems.length === 0) {
      alert("Ваша корзина пуста. Добавьте товары перед оформлением заказа.");
      return;
    }
    if (!validateFields()) return;
    try {
      const cartItemsWithPrices = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        originalPrice: item.price || 0,
        discountedPrice: calculateDiscountedPrice(item.price || 0),
      }));

      const response = await fetch(`${baseURL}/api/send-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderDetails,
          deliveryDetails,
          cartItems: cartItemsWithPrices,
          discount,
          promoCode,
          branchId: selectedBranch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при отправке заказа");
      }

      setIsOrderSent(true);
      setCartItems([]);
      localStorage.removeItem("cartItems");
      setTimeout(() => setIsOrderSent(false), 4000);
    } catch (error) {
      console.error("Ошибка при отправке заказа:", error);
      alert(error.message || "Ошибка при отправке заказа.");
    }
  };

  const calculateDiscountedPrice = (price) => {
    const validPrice = price || 0;
    return validPrice * (1 - discount / 100);
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = item.price || 0;
      return sum + price * item.quantity;
    }, 0);
    const discountedTotal = total * (1 - discount / 100);
    return {
      total: total.toFixed(2),
      discountedTotal: discountedTotal.toFixed(2),
    };
  };

  const closeProductModal = () => {
    setIsModalClosing(true);
    setModalPosition(0);
    setTimeout(() => {
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      setPizzaSize(null);
      setErrorMessage("");
      setIsModalClosing(false);
    }, 400);
  };

  const handleOutsideClick = (e) => {
    if (e.target.className.includes("modal") && !isModalClosing) {
      closeProductModal();
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      const { deltaY } = eventData;
      if (deltaY > 0 && modalRef.current) {
        setModalPosition(deltaY);
      }
    },
    onSwipedDown: (eventData) => {
      if (eventData.deltaY > 100) {
        closeProductModal();
      } else {
        setModalPosition(0);
      }
    },
    preventScrollOnSwipe: true,
  });

  const handleBranchSelect = (branchId) => {
    setSelectedBranch(branchId);
    localStorage.setItem("selectedBranch", branchId);
    setIsBranchModalOpen(false);
    setProducts([]);
    setMenuItems({});
  };

  const handleChangeBranch = () => {
    setIsBranchModalOpen(true);
  };

  return (
    <div className="menu-wrapper">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner">Загрузка...</div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}

      {isBranchModalOpen && (
        <div className="modal-overlay" onClick={() => branches.length > 0 && setIsBranchModalOpen(false)}>
          <div className="branch-modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Выберите филиал</h2>
            <div className="branch-list">
              {branches.length > 0 ? (
                branches.map(branch => (
                  <div 
                    key={branch.id} 
                    className={`branch-item ${selectedBranch === branch.id ? 'selected' : ''}`}
                    onClick={() => handleBranchSelect(branch.id)}
                  >
                    <div className="branch-name">{branch.name}</div>
                    <div className="branch-address">{branch.address}</div>
                  </div>
                ))
              ) : (
                <div className="no-branches">
                  <p>Филиалы не найдены</p>
                  <button onClick={fetchBranches} className="refresh-button">
                    Обновить
                  </button>
                </div>
              )}
            </div>
            {branches.length > 0 && (
              <button 
                className="close-modal-button" 
                onClick={() => setIsBranchModalOpen(false)}
              >
                Закрыть
              </button>
            )}
          </div>
        </div>
      )}

      <div className="branch-info">
        <div className="branch-status">
          {selectedBranch && branches.length > 0 ? (
            <>
              <span>Филиал: {branches.find(b => b.id === parseInt(selectedBranch))?.name || 'Неизвестный филиал'}</span>
              <button onClick={handleChangeBranch} className="change-branch-btn">
                Сменить
              </button>
            </>
          ) : (
            <span>Выберите филиал для продолжения</span>
          )}
        </div>
      </div>

      {selectedBranch && products.length > 0 && (
        <>
          <h2 className="Mark_Shop">Часто продаваемые товары</h2>
          <div className="best-sellers">
            {products
              .filter((product) => product.category === "Часто продаваемые товары")
              .map((product) => (
                <div
                  className="best-seller-product"
                  key={product.id}
                  onClick={() => handleProductClick(product, "Часто продаваемые товары")}
                >
                  <LazyImage
                    className="best-seller-product-image"
                    src={`https://nukesul-brepb-651f.twc1.net${product.image_url}`}
                    alt={product.name}
                    placeholder={`data:image/svg+xml,${encodeURIComponent(jpgPlaceholder)}`}
                  />
                  <div className="best-seller-product-info">
                    <h3 className="best-seller-product-title">{product.name}</h3>
                    <div className="best-seller-product-price">
                      {isPizza(product) ? (
                        <p className="best-sellers_price_p">
                          {product.price_small} - {product.price_large} Сом
                        </p>
                      ) : product.price ? (
                        <p className="best-sellers_price_p">Цена: {product.price} Сом</p>
                      ) : (
                        <p className="best-sellers_price_p">Цена не указана</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="halal_box">
            <img className="halal_img" src={halal} alt="Halal" />
            <h1 className="halal_title">
              Без свинины
              <p className="halal_subtitle">Мы готовим из цыпленка и говядины</p>
            </h1>
          </div>

          <div className="option__container">
            <div className="option__name" ref={menuRef}>
              <ul>
                {Object.entries(menuItems).map(([category]) =>
                  category !== "Часто продаваемые товары" ? (
                    <li key={category}>
                      <a
                        className={activeCategory === category ? "active" : ""}
                        href={`#${category}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(category)?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                      >
                        {categoryEmojis[category] || ""} {category}
                      </a>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>

          <div className="menu-items">
            {Object.entries(menuItems)
              .filter(([category]) => category !== "Часто продаваемые товары")
              .map(([category, products]) => (
                <div
                  className="menu-category"
                  key={category}
                  id={category}
                  ref={(el) => (sectionRefs.current[category] = el)}
                >
                  <h2 className="menu-category-title">{category}</h2>
                  <div className="menu-products">
                    {products.map((product) => (
                      <div
                        className="menu-product"
                        key={product.id}
                        onClick={() => handleProductClick(product, category)}
                      >
                        <LazyImage
                          className="menu-product-image"
                          src={`https://nukesul-brepb-651f.twc1.net${product.image_url}`}
                          alt={product.name}
                          placeholder={`data:image/svg+xml,${encodeURIComponent(jpgPlaceholder)}`}
                        />
                        <div className="menu-product-info">
                          <h3 className="menu-product-title">{product.name}</h3>
                          <p className="menu-product-price">
                            {isPizza(product)
                              ? `${product.price_small} - ${product.price_large} Сом`
                              : `${product.price || 0} Сом`}
                          </p>
                          <p className="menu-product-description">{product.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {selectedProduct && isProductModalOpen && (
        <div
          ref={modalRef}
          {...swipeHandlers}
          className={`modal ${isProductModalOpen ? "see" : ""} ${isModalClosing ? "closing" : ""}`}
          onClick={handleOutsideClick}
        >
          <div
            className="modal-content"
            style={modalRef.current ? {
              transform: `translateY(${modalPosition}px)`,
              transition: isModalClosing ? "transform 0.3s ease, opacity 0.3s ease" : "none",
              opacity: isModalClosing ? 0 : 1,
            } : {}}
          >
            <button className="close-modal" onClick={closeProductModal}>
              ⟨
            </button>
            <div className="modal-body">
              <img
                src={`https://nukesul-brepb-651f.twc1.net${selectedProduct.product.image_url}`}
                alt={selectedProduct.product.name}
                className="modal-image"
              />
              <div className="modal-info">
                <h1>{selectedProduct.product.name}</h1>
                <p>{selectedProduct.product.description}</p>
                {isPizza(selectedProduct.product) && (
                  <div className="pizza-selection">
                    <h3>Выберите размер:</h3>
                    <div className="pizza-sizes">
                      <div
                        className={`pizza-size ${pizzaSize === "small" ? "selected" : ""}`}
                        onClick={() => setPizzaSize("small")}
                      >
                        Маленькая
                      </div>
                      <div
                        className={`pizza-size ${pizzaSize === "medium" ? "selected" : ""}`}
                        onClick={() => setPizzaSize("medium")}
                      >
                        Средняя
                      </div>
                      <div
                        className={`pizza-size ${pizzaSize === "large" ? "selected" : ""}`}
                        onClick={() => setPizzaSize("large")}
                      >
                        Большая
                      </div>
                    </div>
                  </div>
                )}
                <button className="add-to-cart" onClick={handleAddToCart}>
                  Добавить в корзину за{" "}
                  <span className="green-price">
                    {isPizza(selectedProduct.product) && pizzaSize
                      ? selectedProduct.product[`price_${pizzaSize.toLowerCase()}`]
                      : selectedProduct.product.price || 0}
                  </span>{" "}
                  Сом
                </button>
                {errorMessage && (
                  <div className="error-message">
                    <p>{errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isCartOpen && (
        <Cart
          cartItems={cartItems}
          onQuantityChange={handleQuantityChange}
          onClick={handleCartOpen}
        />
      )}

      {isCartOpen && (
        <div className="order-page">
          <div className="button-group">
            <button className="button_buy" onClick={() => setIsOrderSection(false)}>
              Доставка
            </button>
            <button className="button_buy" onClick={() => setIsOrderSection(true)}>
              С собой
            </button>
          </div>
          <div className="items-section">
            {cartItems.map((item) => {
              const price = item.price || 0;
              const discountedPrice = calculateDiscountedPrice(price).toFixed(2);
              return (
                <div key={item.id} className="order-item">
                  <img src={`https://nukesul-brepb-651f.twc1.net${item.image}`} alt={item.name} />
                  <div className="order-item-info">
                    <h3>{item.name}</h3>
                    {discount > 0 ? (
                      <>
                        <p className="original-price">{price.toFixed(2)} сом</p>
                        <p className="discounted-price">{discountedPrice} сом</p>
                      </>
                    ) : (
                      <p>{price.toFixed(2)} сом</p>
                    )}
                    <div className="ad_more">
                      <button
                        className="quantity-button"
                        onClick={() => handleQuantityChange(item.id, -1)}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-button"
                        onClick={() => handleQuantityChange(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="order-details">
            <div className="total-section">
              <h3 className="total-price">
                Итого:
                {discount > 0 ? (
                  <>
                    <span className="original-total-price">{calculateTotal().total} сом</span>
                    <span className="discounted-total-price">
                      {calculateTotal().discountedTotal} сом
                    </span>
                  </>
                ) : (
                  `${calculateTotal().total} сом`
                )}
              </h3>
            </div>
            <div className="promo-section">
              <label htmlFor="promo-code">Промокод:</label>
              <input
                type="text"
                id="promo-code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button onClick={handlePromoCodeSubmit}>Применить</button>
            </div>
            <h2>{isOrderSection ? "С собой" : "Доставка"}</h2>
            {isOrderSection ? (
              <>
                <div className="input-group">
                  <label htmlFor="order-name">Имя:</label>
                  <input
                    type="text"
                    name="name"
                    value={orderDetails.name}
                    onChange={handleOrderChange}
                  />
                  {formErrors.name && <p className="error">{formErrors.name}</p>}
                </div>
                <div className="input-group">
                  <label htmlFor="order-phone">Телефон:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={orderDetails.phone}
                    onChange={handleOrderChange}
                  />
                  {formErrors.phone && <p className="error">{formErrors.phone}</p>}
                </div>
                <div className="input-group">
                  <label htmlFor="order-comments">Комментарии:</label>
                  <textarea
                    name="comments"
                    value={orderDetails.comments}
                    onChange={handleOrderChange}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label htmlFor="delivery-name">Имя:</label>
                  <input
                    type="text"
                    name="name"
                    value={deliveryDetails.name}
                    onChange={handleDeliveryChange}
                  />
                  {formErrors.name && <p className="error">{formErrors.name}</p>}
                </div>
                <div className="input-group">
                  <label htmlFor="delivery-phone">Телефон:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryDetails.phone}
                    onChange={handleDeliveryChange}
                  />
                  {formErrors.phone && <p className="error">{formErrors.phone}</p>}
                </div>
                <div className="input-group">
                  <label htmlFor="delivery-address">Адрес:</label>
                  <input
                    type="text"
                    name="address"
                    value={deliveryDetails.address}
                    onChange={handleDeliveryChange}
                  />
                  {formErrors.address && <p className="error">{formErrors.address}</p>}
                </div>
                <div className="input-group">
                  <label htmlFor="delivery-comments">Комментарии:</label>
                  <textarea
                    name="comments"
                    value={deliveryDetails.comments}
                    onChange={handleDeliveryChange}
                  />
                </div>
              </>
            )}
            <div className="buttons">
              <button className="continue-button" onClick={handleCartClose}>
                Продолжить
              </button>
              <button className="confirm-button" onClick={sendOrderToServer}>
                Подтвердить заказ
              </button>
            </div>
          </div>
        </div>
      )}

      {isOrderSent && (
        <div className="success-modal">
          <div className="success-modal-content">
            <div className="checkmark-circle">
              <div className="checkmark"></div>
            </div>
            <div className="success-message">
              Товар отправлен! Наши сотрудники свяжутся с вами.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;