import React from 'react';
import InputField from './InputField';
import { calculatorSecondaryButton, calculatorSoftCard } from './tailwind';

const TRANSPORT_MODES = ['car', 'bike', 'bus', 'train', 'metro', 'flight', 'cycle'];
const FUEL_TYPES = ['petrol', 'diesel', 'cng', 'electric'];
const TRAFFIC_LEVELS = ['low', 'medium', 'high'];
const VEHICLE_AGES = ['new', '5yr', '10yr'];

const TransportEntry = ({
  entry,
  index,
  onChange,
  onRemove,
  canRemove,
  errors = {},
}) => {
  const prefix = `transport_${index}`;
  const displayNumericValue = (value) => (value === '' ? '' : value || 0);
  const handleNumericFocus = (value, applyValue) => {
    if (Number(value) === 0) {
      applyValue('');
    }
  };
  const handleNumericBlur = (value, applyValue) => {
    if (value === '') {
      applyValue(0);
    }
  };
  const showVehicleFields = entry.mode === 'car' || entry.mode === 'bike';
  const showTransitFields =
    entry.mode === 'bus' || entry.mode === 'train' || entry.mode === 'metro';
  const showFlightFields = entry.mode === 'flight';
  const showCycleState = entry.mode === 'cycle';

  return (
    <div className={`transport-entry-card ${calculatorSoftCard} grid gap-4 p-5`}>
      <div className="transport-entry-header flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-extrabold tracking-[-0.03em] text-[#111111] dark:text-slate-50">
            Transport Block {index + 1}
          </h4>
          <p className="text-sm text-[#666666] dark:text-slate-400">
            Configure one travel pattern for a more realistic footprint.
          </p>
        </div>
        {canRemove ? (
          <button
            type="button"
            className={`transport-remove-button ${calculatorSecondaryButton} px-4 py-2 text-sm`}
            onClick={() => onRemove(entry.id)}
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="calculator-field-grid transport-field-grid grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <InputField label="Transport Mode" icon="T" required fieldKey={`${prefix}_mode`}>
          <select
            value={entry.mode}
            onChange={(event) => onChange(entry.id, 'mode', event.target.value)}
            className="calculator-control calculator-select w-full rounded-2xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.96)] px-4 py-3.5 text-[15px] text-[#111111] outline-none transition duration-200 hover:border-[#d4d4d4] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
          >
            {TRANSPORT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </option>
            ))}
          </select>
        </InputField>

        {(showVehicleFields || showTransitFields || showFlightFields) && (
          <InputField
            label="Distance (km)"
            icon="D"
            required
            fieldKey={`${prefix}_distance`}
            error={errors[`${prefix}_distance`]}
          >
            <input
              type="number"
              min="0"
              value={displayNumericValue(entry.distance)}
              onFocus={() => handleNumericFocus(entry.distance, (value) => onChange(entry.id, 'distance', value))}
              onBlur={() => handleNumericBlur(entry.distance, (value) => onChange(entry.id, 'distance', value))}
              onChange={(event) => onChange(entry.id, 'distance', event.target.value)}
              className="calculator-control calculator-input w-full rounded-2xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.96)] px-4 py-3.5 text-[15px] text-[#111111] outline-none transition duration-200 hover:border-[#d4d4d4] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
            />
          </InputField>
        )}

        {showVehicleFields && (
          <>
            <InputField label="Fuel Type" icon="F" required fieldKey={`${prefix}_fuelType`}>
              <select
                value={entry.fuelType}
                onChange={(event) => onChange(entry.id, 'fuelType', event.target.value)}
                className="calculator-control calculator-select w-full rounded-2xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.96)] px-4 py-3.5 text-[15px] text-[#111111] outline-none transition duration-200 hover:border-[#d4d4d4] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
              >
                {FUEL_TYPES.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField
              label="Mileage"
              icon="M"
              required
              fieldKey={`${prefix}_mileage`}
              error={errors[`${prefix}_mileage`]}
            >
              <input
                type="number"
                min="1"
                value={displayNumericValue(entry.mileage)}
                onFocus={() => handleNumericFocus(entry.mileage, (value) => onChange(entry.id, 'mileage', value))}
                onBlur={() => handleNumericBlur(entry.mileage, (value) => onChange(entry.id, 'mileage', value))}
                onChange={(event) => onChange(entry.id, 'mileage', event.target.value)}
                className="calculator-control calculator-input w-full rounded-2xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.96)] px-4 py-3.5 text-[15px] text-[#111111] outline-none transition duration-200 hover:border-[#d4d4d4] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
              />
            </InputField>
            <InputField label="Traffic Level" icon="TL" fieldKey={`${prefix}_trafficLevel`}>
              <select
                value={entry.trafficLevel}
                onChange={(event) => onChange(entry.id, 'trafficLevel', event.target.value)}
                className="calculator-control calculator-select w-full rounded-2xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.96)] px-4 py-3.5 text-[15px] text-[#111111] outline-none transition duration-200 hover:border-[#d4d4d4] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
              >
                {TRAFFIC_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField label="Vehicle Age" icon="VA" fieldKey={`${prefix}_vehicleAge`}>
              <select
                value={entry.vehicleAge}
                onChange={(event) => onChange(entry.id, 'vehicleAge', event.target.value)}
                className="calculator-control calculator-select w-full rounded-2xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.96)] px-4 py-3.5 text-[15px] text-[#111111] outline-none transition duration-200 hover:border-[#d4d4d4] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
              >
                {VEHICLE_AGES.map((age) => (
                  <option key={age} value={age}>
                    {age === 'new' ? 'New' : age}
                  </option>
                ))}
              </select>
            </InputField>
          </>
        )}

        {showFlightFields && (
          <InputField label="Flight Type" icon="FT" fieldKey={`${prefix}_flightType`}>
            <select
              value={entry.flightType}
              onChange={(event) => onChange(entry.id, 'flightType', event.target.value)}
              className="calculator-control calculator-select w-full rounded-2xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.96)] px-4 py-3.5 text-[15px] text-[#111111] outline-none transition duration-200 hover:border-[#d4d4d4] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </InputField>
        )}

        {showCycleState ? (
          <div className="transport-zero-message rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Zero emission mode Bicycle
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TransportEntry;
