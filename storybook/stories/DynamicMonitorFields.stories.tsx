/**
 * Stories for the DynamicMonitorFields component highlighting runtime field
 * rendering.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { action } from "storybook/actions";

import { DynamicMonitorFields } from "@app/components/AddSiteForm/DynamicMonitorFields";
import type { DynamicMonitorFieldsProperties } from "@app/components/AddSiteForm/DynamicMonitorFields";
import { useMonitorTypesStore } from "@app/stores/monitor/useMonitorTypesStore";
import type { MonitorType } from "@shared/types";

import { primeMonitorTypesStore } from "../helpers/monitorTypeStoryHelpers";

primeMonitorTypesStore();

const getFieldDefaults = (
    monitorType: MonitorType
): Record<string, number | string> => {
    const store = useMonitorTypesStore.getState();
    const fields = store.getFieldConfig(monitorType) ?? [];

    return Object.fromEntries(
        fields.map((field) => [field.name, field.type === "number" ? 0 : ""])
    );
};

type DynamicMonitorFieldsStoryArgs = Pick<
    DynamicMonitorFieldsProperties,
    "monitorType"
>;

const DynamicMonitorFieldsStory = (
    args: DynamicMonitorFieldsStoryArgs
): ReactElement => {
    const monitorType = args.monitorType as MonitorType;

    const [values, setValues] = useState<Record<string, number | string>>(() =>
        getFieldDefaults(monitorType)
    );
    const [isLoading, setIsLoading] = useState(false);

    const fields = useMonitorTypesStore((state) =>
        state.getFieldConfig(monitorType)
    );

    useEffect(() => {
        setValues(getFieldDefaults(monitorType));
    }, [monitorType]);

    const handleChangeMap = useMemo(() => {
        if (!fields) {
            return {};
        }

        return Object.fromEntries(
            fields.map((field) => [
                field.name,
                (value: number | string) => {
                    action(`dynamic-fields/${field.name}`)(value);
                    setValues((previous) => ({
                        ...previous,
                        [field.name]: value,
                    }));
                },
            ])
        );
    }, [fields]);

    const simulateLoading = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 600);
    }, []);

    if (!fields || fields.length === 0) {
        return (
            <div className="rounded border border-dashed border-slate-400 p-6 text-center text-sm text-slate-400">
                Monitor type "{args.monitorType}" has no field configuration
                registered.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <DynamicMonitorFields
                isLoading={isLoading}
                monitorType={args.monitorType}
                onChange={handleChangeMap}
                values={values}
            />
            <button
                className="self-start rounded border border-slate-300 px-3 py-1 text-sm"
                onClick={simulateLoading}
                type="button"
            >
                Simulate Loading
            </button>
        </div>
    );
};

const meta: Meta<typeof DynamicMonitorFieldsStory> = {
    args: {
        monitorType: "http",
    },
    component: DynamicMonitorFieldsStory,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    title: "Add Site/Form Fields/DynamicMonitorFields",
} satisfies Meta<typeof DynamicMonitorFieldsStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HttpFields: Story = {};

export const DnsWithAnyRecord: Story = {
    args: {
        monitorType: "dns",
    },
    render: (args) => {
        return <DynamicMonitorFieldsStory {...args} />;
    },
};

export const UnknownMonitorType: Story = {
    args: {
        monitorType: "unregistered" as MonitorType,
    },
};
