import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

interface QuestionStepProps {
  label: string;
  value: any;
  type?: 'dropdown' | 'number';
  options?: { label: string; value: any }[];
  onChange: (value: any) => void;
}

const QuestionStep: React.FC<QuestionStepProps> = ({ label, value, type = 'dropdown', options = [], onChange }) => {
  return (
    <div className="field col-12 md:col-6" style={{ marginBottom: '1.5rem' }}>
      <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>{label}</label>
      {type === 'dropdown' ? (
        <Dropdown
          value={value}
          options={options}
          onChange={(e) => onChange(e.value)}
          placeholder="Selecione uma opção"
          className="w-full"
          appendTo={document.body}
        />
      ) : (
        <InputNumber
          value={value}
          onValueChange={(e) => onChange(e.value ?? 0)}
          min={1}
          max={5}
          showButtons
          buttonLayout="horizontal"
          decrementButtonClassName="p-button-outlined"
          incrementButtonClassName="p-button-outlined"
          inputStyle={{ width: '4rem', textAlign: 'center' }}
        />
      )}
    </div>
  );
};

export default QuestionStep;
