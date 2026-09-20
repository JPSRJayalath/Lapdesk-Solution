import { useState } from "react";

export function useAddItems() {
  const [showAddItems, setShowAddItems] = useState(false);

  const handleAddItems = () => {
    setShowAddItems((prev) => !prev);
  };

  return {
    showAddItems,
    handleAddItems,
  };
}

export function useNavigation() {
  const [activeContainer, setActiveContainer] = useState(1);

  const showContainer = (container: number) => {
    setActiveContainer(container);
  };

  return {
    activeContainer,
    showContainer,
  };
}