import { useEffect, useState } from "react";
import { type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigation } from "./hooks/useAddItems";
import "./App.css";

type Item = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

function App() {
  const { activeContainer, showContainer } = useNavigation();

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedItemId, setSelectedItemId] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateStock, setUpdateStock] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  

  const fetchItems = async () => {
    try {
      const result = await invoke<Item[]>("get_items");

      console.log("GET ITEMS RESULT:", result);
      console.log("ITEM COUNT:", result.length);

      setItems(result);
    } catch (error) {
      console.error("GET ITEMS ERROR:", error);
    }
  };

  // Load database when app starts
  useEffect(() => {
    fetchItems();
  }, []);

  // Keep selected item preview synchronized with database
  useEffect(() => {
    if (!selectedItem) return;

    const updatedItem = items.find(
      (item) => item.id === selectedItem.id
    );

    if (updatedItem) {
      setSelectedItem(updatedItem);
    } else {
      setSelectedItem(null);
    }
  }, [items]);

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);

    const selectedItem = items.find(
      (item) => item.id === Number(id)
    );

    if (!selectedItem) {
      setUpdateName("");
      setUpdateStock("");
      setUpdatePrice("");
      return;
    }

    setUpdateName(selectedItem.name);
    setUpdateStock(String(selectedItem.stock));
    setUpdatePrice(String(selectedItem.price));
  };

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("CONFIRM CLICKED");

    const item = {
      name: name,
      price: Number(price),
      stock: Number(stock),
    };

    console.log("Sending item:", item);

    try {
      await invoke("add_item", {
          item: item,
      });

      console.log("ITEM ADDED SUCCESSFULLY");

      setName("");
      setStock("");
      setPrice("");

      showContainer(1);

      await fetchItems();

    } catch (error) {
        console.error("ADD ITEM FAILED:", error);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div>
          <img src="/lapdesk-solution.png" alt="lapdesk-solution-img" className="logo"/>
        </div>
      </nav>
      <section className="main-window">
        <div className="container-1" style={{display: activeContainer === 1 ? undefined : "none"}}>
          <div className="form-container">
            <form
              className="search-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="search"
                placeholder="Search..."
                aria-label="Search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </form>

            <div className="function-container">
              <button onClick={() => showContainer(2)}>
                <img src="add.png" alt="add-img" />
                <span>Add Items</span>
              </button>

              <button onClick={() => showContainer(3)}>
                <img src="update.png" alt="update-img" />
                <span>Update</span>
              </button>

              <button onClick={() => showContainer(4)}>
                <img src="remove.png" alt="remove-img" />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <div className="container-2">
              {items.length > 0 ? (
                <div className="db-data">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        className={`item ${
                          selectedItem?.id === item.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <span>{item.name}</span>

                        {item.stock <= 10 && (
                          <div className="low-stock">
                            <span>Low Stock</span>
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="no-search">
                      <h2>No Items Found</h2>
                      <p>No item matches "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data">
                  <h2>No Data Available</h2>
                </div>
              )}
            <div className="item-preview">
              <div className="img-preview">
                <img src="/microchip.png" alt="microchip-img" />
              </div>
              <div className="item-details">
                <div className="item-name">
                  <h2>Name: </h2><span>{selectedItem?.name ?? "N/A"}</span>
                </div>
                <div className="availability">
                  <h2>Available Stock:</h2>
                  <span className={selectedItem && selectedItem.stock <= 10 ? "low-stock-text" : ""}>
                    {selectedItem?.stock ?? "N/A"}
                  </span>
                </div>
                <div className="item-price">
                  <h2>Price: </h2><span>{selectedItem?.price ?? "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-3" style={{display: activeContainer === 2 ? "block" : "none"}}>
          <form onSubmit={handleAddItem} className="actions-form">
            <div className="sub-container-1">
              <h1>Adding Item</h1>
              <div className="form-item-name">
                <h2>Name: </h2><input type="text" value={name} onChange={(event) => setName(event.target.value)} required/>
              </div>
              <div className="form-availability">
                <h2>Available Stock: </h2><input type="number" name="stock" placeholder="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required/>
              </div>
              <div className="form-item-price">
                <h2>Price: </h2><input type="number" name="price" placeholder="0.00" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required/>
              </div>
            </div>
            <div className="sub-container-2">
              <button type="submit" className="ok">
                <img src="ok.png" alt="ok-img" />
                <span>Confirm</span>
              </button>
              <button type="button" className="cancel" onClick={() => showContainer(1)}>
                <img src="cancel.png" alt="cancel-img" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
        <div
          className="container-4"
          style={{ display: activeContainer === 3 ? "block" : "none" }}
        >
          <form
            className="actions-form"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!selectedItemId) {
                return;
              }

              try {
                await invoke("update_item", {
                  id: Number(selectedItemId),
                  name: updateName,
                  price: Number(updatePrice),
                  stock: Number(updateStock),
                });

                console.log("ITEM UPDATED");

                await fetchItems();

                setSelectedItemId("");
                setUpdateName("");
                setUpdateStock("");
                setUpdatePrice("");

                showContainer(1);
              } catch (error) {
                console.error("UPDATE ITEM FAILED:", error);
              }
            }}
          >
            <div className="sub-container-1">

              <h1>Update Item</h1>

              <div className="exist-selector">
                <h2>Items</h2>

                <select
                  value={selectedItemId}
                  onChange={(event) => handleItemSelect(event.target.value)}
                  required
                >
                  <option value="">Select an item</option>

                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item-name">
                <h2>Name: </h2>

                <input
                  type="text"
                  value={updateName}
                  onChange={(event) => setUpdateName(event.target.value)}
                  required
                />
              </div>

              <div className="form-availability">
                <h2>Available Stock: </h2>

                <input
                  type="number"
                  name="stock"
                  placeholder="0"
                  step="1"
                  value={updateStock}
                  onChange={(event) => setUpdateStock(event.target.value)}
                  required
                />
              </div>

              <div className="form-item-price">
                <h2>Price: </h2>

                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  step="0.01"
                  value={updatePrice}
                  onChange={(event) => setUpdatePrice(event.target.value)}
                  required
                />
              </div>

            </div>

            <div className="sub-container-2">

              <button type="submit" className="ok">
                <img src="ok.png" alt="ok-img" />
                <span>Confirm</span>
              </button>

              <button
                type="button"
                className="cancel"
                onClick={() => showContainer(1)}
              >
                <img src="cancel.png" alt="cancel-img" />
                <span>Cancel</span>
              </button>

            </div>
          </form>
        </div>
        <div
          className="container-5"
          style={{ display: activeContainer === 4 ? "block" : "none" }}
        >
          <form
            className="actions-form"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!selectedItemId) {
                return;
              }

              try {
                await invoke("remove_item", {
                  id: Number(selectedItemId),
                });

                console.log("ITEM REMOVED");

                await fetchItems();

                setSelectedItemId("");

                showContainer(1);
              } catch (error) {
                console.error("REMOVE ITEM FAILED:", error);
              }
            }}
          >
            <div className="sub-container-1">
              <h1>Remove Item</h1>

              <div className="exist-selector">
                <h2>Items</h2>

                <select
                  value={selectedItemId}
                  onChange={(event) => setSelectedItemId(event.target.value)}
                  required
                >
                  <option value="">Select an item</option>

                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sub-container-2">
              <button type="submit" className="ok">
                <img src="ok.png" alt="ok-img" />
                <span>Remove</span>
              </button>

              <button
                type="button"
                className="cancel"
                onClick={() => showContainer(1)}
              >
                <img src="cancel.png" alt="cancel-img" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default App;
