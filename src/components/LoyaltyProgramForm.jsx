import { useState } from 'react';
import './LoyaltyProgramForm.css';

export default function LoyaltyProgramForm({ program, onSubmit, onCancel, tags }) {
  const [formData, setFormData] = useState({
    ...program,
    tag_names: program.tag_names || []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTagChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setFormData((prev) => ({
      ...prev,
      tag_names: selected
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      points_required: parseInt(formData.points_required, 10),
      discount_value: parseFloat(formData.discount_value),
      is_percentage: formData.is_percentage,
      tag_names: formData.tag_names, // ✅ BACKEND EXPECTS THIS
      start_date: formData.start_date,
      end_date: formData.end_date || null
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-background">
      <div className="modal-content">
        <h3>Add Loyalty Program</h3>

        <form onSubmit={handleSubmit} className="loyalty-form">

          <label>
            Program Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Points Required:
            <input
              type="number"
              name="points_required"
              value={formData.points_required}
              onChange={handleChange}
              min={0}
              required
            />
          </label>

          <label>
            Discount Value:
            <input
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              min={0}
              step="0.01"
              required
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="is_percentage"
              checked={formData.is_percentage}
              onChange={handleChange}
            />
            Percentage Discount
          </label>

          {/* ✅ MULTI-SELECT TAGS */}
          <label>
            Applicable Tags:
            <select
              multiple
              value={formData.tag_names}
              onChange={handleTagChange}
              required
            >
              {tags.map(tag => (
                <option key={tag.tag_id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Start Date:
            <input
              type="date"
              name="start_date"
              value={formData.start_date || ''}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            End Date (optional):
            <input
              type="date"
              name="end_date"
              value={formData.end_date || ''}
              onChange={handleChange}
            />
          </label>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
