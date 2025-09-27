import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';

// InputField Component
interface InputFieldProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  invalid?: boolean;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'text' | 'password' | 'email';
  showClearButton?: boolean;
  loading?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  value = '',
  onChange,
  label,
  placeholder,
  helperText,
  errorMessage,
  disabled = false,
  invalid = false,
  variant = 'outlined',
  size = 'md',
  type = 'text',
  showClearButton = false,
  loading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const variantClasses = {
    filled: 'bg-gray-100 border-transparent focus:bg-white focus:border-blue-500',
    outlined: 'bg-white border-gray-300 focus:border-blue-500',
    ghost: 'bg-transparent border-transparent focus:bg-gray-50 focus:border-gray-300',
  };

  const inputClasses = `
    w-full rounded-lg border-2 transition-all duration-200 outline-none
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
    ${invalid || errorMessage ? 'border-red-500 focus:border-red-500' : ''}
    ${isFocused ? 'ring-2 ring-blue-100' : ''}
    pr-${type === 'password' || showClearButton ? '12' : '4'}
  `;

  const handleClear = () => {
    if (onChange) {
      const event = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || !!errorMessage}
          aria-describedby={helperText ? 'helper-text' : errorMessage ? 'error-text' : undefined}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
        
        {!loading && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        
        {!loading && showClearButton && value && type !== 'password' && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear input"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {errorMessage && (
        <p id="error-text" className="mt-2 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
      
      {helperText && !errorMessage && (
        <p id="helper-text" className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

// DataTable Component
interface Column<T> {
  key: string;
  title: string;
  dataIndex: keyof T;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  keyExtractor?: (record: T) => string | number;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  selectable = false,
  onRowSelect,
  keyExtractor = (record, index) => index,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (columnKey: string) => {
    const newDirection = 
      sortConfig?.key === columnKey && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setSortConfig({ key: columnKey, direction: newDirection });
  };

  const handleRowSelect = (rowKey: string | number, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    
    if (checked) {
      newSelectedRows.add(rowKey);
    } else {
      newSelectedRows.delete(rowKey);
    }
    
    setSelectedRows(newSelectedRows);
    
    if (onRowSelect) {
      const selectedData = data.filter((_, index) => 
        newSelectedRows.has(keyExtractor(data[index], index))
      );
      onRowSelect(selectedData);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = new Set(data.map((record, index) => keyExtractor(record, index)));
      setSelectedRows(allKeys);
      onRowSelect?.(data);
    } else {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    }
  };

  const isAllSelected = selectedRows.size === data.length && data.length > 0;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;

  if (loading) {
    return (
      <div className="w-full border border-gray-200 rounded-lg">
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full border border-gray-200 rounded-lg">
        <div className="p-8 text-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center space-x-1 hover:text-gray-700"
                      aria-label={`Sort by ${column.title}`}
                    >
                      <span>{column.title}</span>
                      {sortConfig?.key === column.key ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      ) : (
                        <ChevronUp className="w-4 h-4 opacity-30" />
                      )}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((record, index) => {
              const rowKey = keyExtractor(record, index);
              const isSelected = selectedRows.has(rowKey);
              
              return (
                <tr
                  key={rowKey}
                  className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(rowKey, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        aria-label={`Select row ${index + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render 
                        ? column.render(record[column.dataIndex], record)
                        : String(record[column.dataIndex] || '-')
                      }
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Demo Component
export default function ComponentDemo() {
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Sample data for the table
  const userData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
  ];

  const columns = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name' as keyof typeof userData[0],
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email' as keyof typeof userData[0],
      sortable: true,
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role' as keyof typeof userData[0],
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status' as keyof typeof userData[0],
      render: (status: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      ),
    },
  ];

  const toggleTableLoading = () => {
    setTableLoading(true);
    setTimeout(() => setTableLoading(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">React Components Demo</h1>
        <p className="text-gray-600">Interactive demonstration of InputField and DataTable components</p>
      </div>

      {/* InputField Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">InputField Component</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Input */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Basic Input</h3>
            <InputField
              label="Username"
              placeholder="Enter your username"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Choose a unique username"
              showClearButton
            />
          </div>

          {/* Password Input */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Password Input</h3>
            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              helperText="Must be at least 8 characters"
            />
          </div>

          {/* Error State */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Error State</h3>
            <InputField
              label="Email"
              placeholder="Enter your email"
              value="invalid-email"
              invalid
              errorMessage="Please enter a valid email address"
            />
          </div>

          {/* Variants */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Filled Variant</h3>
            <InputField
              variant="filled"
              placeholder="Filled input"
              helperText="This is a filled input"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Ghost Variant</h3>
            <InputField
              variant="ghost"
              placeholder="Ghost input"
              helperText="This is a ghost input"
            />
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Different Sizes</h3>
            <div className="space-y-3">
              <InputField size="sm" placeholder="Small input" />
              <InputField size="md" placeholder="Medium input" />
              <InputField size="lg" placeholder="Large input" />
            </div>
          </div>

          {/* Disabled State */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Disabled State</h3>
            <InputField
              label="Disabled Input"
              placeholder="This input is disabled"
              value="Cannot edit this"
              disabled
            />
          </div>

          {/* Loading State */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Loading State</h3>
            <InputField
              label="Loading Input"
              placeholder="Loading..."
              loading
              helperText="Simulating async validation"
            />
          </div>
        </div>
      </section>

      {/* DataTable Demo */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">DataTable Component</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Selected: {selectedUsers.length} users
              </p>
            </div>
            <button
              onClick={toggleTableLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Toggle Loading
            </button>
          </div>

          <DataTable
            data={userData}
            columns={columns}
            loading={tableLoading}
            selectable={true}
            onRowSelect={setSelectedUsers}
            keyExtractor={(record) => record.id}
          />

          {selectedUsers.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Users:</h4>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}