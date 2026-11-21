
"use client";

import { useEffect, useMemo, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { State, City } from "country-state-city";

interface Props {
    initialState?: string;
    initialCity?: string;
    onChange: (data: {
        state: string;
        city: string;
    }) => void;
}

type Option = {
    value: string;
    label: string;
};

const selectStyles: StylesConfig<Option, false> = {
    control: (base, state) => ({
        ...base,
        minHeight: "52px",
        height: "52px",
        borderRadius: "10px",
        border: state.isFocused
            ? "1px solid #176348"
            : "1px solid #e2e5e2",
        boxShadow: state.isFocused
            ? "0 0 0 3px rgba(23, 99, 72, 0.08)"
            : "none",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        transition: "all 150ms ease",
        "&:hover": {
            borderColor: "#176348",
        },
    }),

    valueContainer: (base) => ({
        ...base,
        padding: "0 15px",
    }),

    singleValue: (base) => ({
        ...base,
        color: "#071630",
        fontSize: "15px",
        fontWeight: 500,
    }),

    placeholder: (base) => ({
        ...base,
        color: "#9ca3af",
        fontSize: "15px",
    }),

    input: (base) => ({
        ...base,
        color: "#071630",
        fontSize: "15px",
    }),

    indicatorSeparator: () => ({
        display: "none",
    }),

    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? "#176348" : "#89918b",
        padding: "0 14px",
        transition: "transform 150ms ease",
        transform: state.selectProps.menuIsOpen
            ? "rotate(180deg)"
            : "rotate(0deg)",
        "&:hover": {
            color: "#176348",
        },
    }),

    menu: (base) => ({
        ...base,
        marginTop: "7px",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        boxShadow: "0 12px 30px rgba(0,0,0,0.09)",
        zIndex: 50,
    }),

    menuList: (base) => ({
        ...base,
        maxHeight: "220px",
        padding: "5px",
    }),

    option: (base, state) => ({
        ...base,
        borderRadius: "7px",
        padding: "10px 12px",
        fontSize: "14px",
        cursor: "pointer",
        color: state.isSelected ? "#ffffff" : "#26332d",
        backgroundColor: state.isSelected
            ? "#176348"
            : state.isFocused
                ? "#edf5f0"
                : "#ffffff",
        "&:active": {
            backgroundColor: "#dcece3",
        },
    }),

    noOptionsMessage: (base) => ({
        ...base,
        fontSize: "13px",
        color: "#89918b",
    }),
};

export default function LocationSelect({
    initialState = "",
    initialCity = "",
    onChange,
}: Props) {
    const states = useMemo(
        () => State.getStatesOfCountry("IN"),
        []
    );

    const [selectedState, setSelectedState] =
        useState<Option | null>(null);

    const [selectedCity, setSelectedCity] =
        useState<Option | null>(null);

    const stateOptions: Option[] = useMemo(
        () =>
            states.map((state) => ({
                value: state.isoCode,
                label: state.name,
            })),
        [states]
    );

    const cityOptions: Option[] = useMemo(() => {
        if (!selectedState) return [];

        return City.getCitiesOfState(
            "IN",
            selectedState.value
        ).map((city) => ({
            value: city.name,
            label: city.name,
        }));
    }, [selectedState]);

    // Initialize saved state and city
    useEffect(() => {
        const state = states.find(
            (item) =>
                item.name.toLowerCase() === initialState.toLowerCase()
        );

        if (!state) {
            setSelectedState(null);
            setSelectedCity(null);
            return;
        }

        setSelectedState({
            value: state.isoCode,
            label: state.name,
        });

        const cities = City.getCitiesOfState(
            "IN",
            state.isoCode
        );

        const city = cities.find(
            (item) =>
                item.name.toLowerCase() === initialCity.toLowerCase()
        );

        setSelectedCity(
            city
                ? { value: city.name, label: city.name }
                : null
        );
    }, [initialState, initialCity, states]);

    const handleStateChange = (option: Option | null) => {
        setSelectedState(option);
        setSelectedCity(null);

        onChange({
            state: option?.label || "",
            city: "",
        });
    };

    const handleCityChange = (option: Option | null) => {
        setSelectedCity(option);

        onChange({
            state: selectedState?.label || "",
            city: option?.label || "",
        });
    };

    return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 ">

            {/* State */}
            <div className="min-w-0 ">
                <label className="mb-2 block text-sm font-semibold text-[#071630]">
                    State
                </label>

                <Select
                    instanceId="india-state-select"
                    placeholder="Select state"
                    options={stateOptions}
                    value={selectedState}
                    onChange={handleStateChange}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    menuPlacement="auto"
                    noOptionsMessage={() => "No state found"}
                />
            </div>

            {/* City */}
            <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-[#071630]">
                    City
                </label>

                <Select
                    instanceId="india-city-select"
                    placeholder={
                        selectedState
                            ? "Search or select city"
                            : "Select state first"
                    }
                    options={cityOptions}
                    value={selectedCity}
                    onChange={handleCityChange}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    isDisabled={!selectedState}
                    menuPlacement="auto"
                    noOptionsMessage={() => "No city found"}
                />
            </div>
        </div>
    );
}
