const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const api = {
  // Items
  async getItems() {
    const response = await fetch(`${API_URL}/items/`);
    return response.json();
  },
  
  async getLowStockItems(threshold = 10) {
    const response = await fetch(`${API_URL}/items/low-stock?threshold=${threshold}`);
    return response.json();
  },
  
  async getItem(id) {
    const response = await fetch(`${API_URL}/items/${id}`);
    return response.json();
  },
  
  async createItem(item) {
    const response = await fetch(`${API_URL}/items/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return response.json();
  },
  
  async updateItem(id, item) {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return response.json();
  },
  
  async deleteItem(id) {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },
  
  // Categories
  async getCategories() {
    const response = await fetch(`${API_URL}/categories/`);
    return response.json();
  },
  
  async createCategory(category) {
    const response = await fetch(`${API_URL}/categories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    return response.json();
  }
};
