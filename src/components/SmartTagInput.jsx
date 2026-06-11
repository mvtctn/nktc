import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * SmartTagInput — 2-field tag picker
 * Field 1: Combobox with dropdown filtered from `suggestions`
 * Field 2: Quantity / unit text
 * → Click + → creates pill: "Name: Quantity" (or just "Name" if no qty)
 */
export default function SmartTagInput({
  suggestions = [],
  items = [],
  setItems,
  namePlaceholder = 'Chọn hoặc gõ tên...',
  quantityPlaceholder = 'Số lượng, đơn vị...',
  readOnly = false,
}) {
  const [nameText, setNameText] = useState('');
  const [quantityText, setQuantityText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const nameInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const containerRef = useRef(null);

  // Normalize Vietnamese text for case-insensitive diacritic-free matching
  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filtered = suggestions.filter((s) =>
    normalize(s).includes(normalize(nameText))
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectSuggestion = (suggestion) => {
    setNameText(suggestion);
    setShowDropdown(false);
    setHighlightIndex(-1);
    // Auto-focus quantity field after name selection
    setTimeout(() => quantityInputRef.current?.focus(), 50);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown) setShowDropdown(true);
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && highlightIndex >= 0 && filtered[highlightIndex]) {
        selectSuggestion(filtered[highlightIndex]);
      } else {
        setShowDropdown(false);
        quantityInputRef.current?.focus();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleAdd = () => {
    const name = nameText.trim();
    if (!name) return;
    const tag = quantityText.trim()
      ? `${name}: ${quantityText.trim()}`
      : name;
    setItems((prev) => [...prev, tag]);
    setNameText('');
    setQuantityText('');
    nameInputRef.current?.focus();
  };

  const handleQuantityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Input row: [Name dropdown] [Quantity] [+ button] */}
      {!readOnly && (
        <div className="tag-input-row" ref={containerRef}>
          {/* === Field 1: Name combobox === */}
          <div className="tag-input-name-col">
            <input
              ref={nameInputRef}
              type="text"
              className="form-control"
              placeholder={namePlaceholder}
              value={nameText}
              autoComplete="off"
              onChange={(e) => {
                setNameText(e.target.value);
                setShowDropdown(true);
                setHighlightIndex(-1);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleNameKeyDown}
            />

            {/* Dropdown */}
            {showDropdown && filtered.length > 0 && (
              <div
                className="tag-input-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  zIndex: 300,
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(0, 180, 216, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {filtered.map((s, i) => (
                  <div
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(s);
                    }}
                    onMouseEnter={() => setHighlightIndex(i)}
                    style={{
                      padding: '9px 14px',
                      cursor: 'pointer',
                      fontSize: '0.845rem',
                      color: 'var(--text-primary)',
                      background:
                        highlightIndex === i
                          ? 'rgba(0, 180, 216, 0.18)'
                          : 'transparent',
                      borderBottom:
                        i < filtered.length - 1
                          ? '1px solid rgba(255,255,255,0.04)'
                          : 'none',
                      transition: 'background 0.1s',
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === Field 2: Quantity === */}
          <div className="tag-input-qty-col">
            <input
              ref={quantityInputRef}
              type="text"
              className="form-control"
              placeholder={quantityPlaceholder}
              value={quantityText}
              onChange={(e) => setQuantityText(e.target.value)}
              onKeyDown={handleQuantityKeyDown}
            />
          </div>

          {/* === Add button === */}
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-secondary tag-input-btn-col"
            title="Thêm vào danh sách (Enter)"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {/* Pill tags */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: !readOnly ? '8px' : '0' }}>
          {items.map((item, index) => (
            <span
              key={index}
              style={{
                padding: readOnly ? '5px 12px' : '5px 10px 5px 14px',
                background: 'rgba(0, 180, 216, 0.08)',
                border: '1px solid rgba(0, 180, 216, 0.25)',
                borderRadius: '20px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-primary)',
              }}
            >
              {item}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = 'rgba(239,68,68,0.35)')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')
                  }
                  title="Xóa"
                >
                  <X size={11} color="#ef4444" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
