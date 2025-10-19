/**
 * Stories for the DynamicMonitorFields component highlighting runtime field
 * rendering.
 */

import type { DynamicMonitorFieldsProperties } from "@app/components/AddSiteForm/DynamicMonitorFields";
import type { MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
    type Dispatch,
    ReactElement,
    type SetStateAction,
    useCallback,
    useMemo,
    useState,
} from "react";

import { DynamicMonitorFields } from "@app/components/AddSiteForm/DynamicMonitorFields";
import { useMonitorTypesStore } from "@app/stores/monitor/useMonitorTypesStore";
import { action } from "storybook/actions";

import { prepareMonitorTypesStore } from "../helpers/monitorTypeStoryHelpers";

prepareMonitorTypesStore();

type FieldValue = number | string;
type FieldConfig = MonitorTypeConfig["fields"][number];
type FieldChangeHandlers = Record<string, (value: FieldValue) => void>;

const getFieldDefaults = (
    monitorType: MonitorType
): Record<string, FieldValue> => {
    const store = useMonitorTypesStore.getState();
    const fields = store.getFieldConfig(monitorType) ?? [];

    const defaults: Record<string, FieldValue> = {};

    for (const field of fields) {
        defaults[field.name] = field.type === "number" ? 0 : "";
    }

    return defaults;
};

const buildFieldChangeHandlers = (
    fields: readonly FieldConfig[],
    updateValues: Dispatch<SetStateAction<Record<string, FieldValue>>>
): FieldChangeHandlers => {
    const handlers: FieldChangeHandlers = {};

    for (const field of fields) {
        const emitChange = action(`dynamic-fields/${field.name}`);
        handlers[field.name] = (value: FieldValue) => {
            emitChange(value);
            updateValues((previous) => ({
                ...previous,
                [field.name]: value,
            }));
        };
    }

    return handlers;
};

type DynamicMonitorFieldsStoryArgs = Pick<
    DynamicMonitorFieldsProperties,
    "monitorType"
>;

const DynamicMonitorFieldsStoryContent = ({
    monitorType,
}: DynamicMonitorFieldsStoryArgs): ReactElement => {
    const resolvedMonitorType = monitorType as MonitorType;
    const [values, setValues] = useState<Record<string, FieldValue>>(() =>
        getFieldDefaults(resolvedMonitorType)
    );
    const [isLoading, setIsLoading] = useState(false);

    const fields = useMonitorTypesStore((state) =>
        state.getFieldConfig(resolvedMonitorType)
    );

    const handleChangeMap = useMemo(() => {
        if (!fields) {
            return {};
        }

        return buildFieldChangeHandlers(fields, setValues);
    }, [fields]);

    const simulateLoading = useCallback((): void => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 600);
    }, []);

    if (!fields || fields.length === 0) {
        return (
            <div className="rounded-xs border border-dashed border-slate-400 p-6 text-center text-sm text-slate-400">
                Monitor type &quot;{monitorType}&quot; has no field
                configuration registered.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <DynamicMonitorFields
                isLoading={isLoading}
                monitorType={monitorType}
                onChange={handleChangeMap}
                values={values}
            />
            <button
                className="self-start rounded-xs border border-slate-300 px-3 py-1 text-sm"
                onClick={simulateLoading}
                type="button"
            >
                Simulate Loading
            </button>
        </div>
    );
};

const DynamicMonitorFieldsStory = ({
    monitorType,
}: DynamicMonitorFieldsStoryArgs): ReactElement => (
    <DynamicMonitorFieldsStoryContent
        key={monitorType}
        monitorType={monitorType}
    />
);

const meta: Meta<typeof DynamicMonitorFieldsStory> = {
    args: {
        monitorType: "http",
    },
    component: DynamicMonitorFieldsStory,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof DynamicMonitorFieldsStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HttpFields: Story = {};

export const DnsWithAnyRecord: Story = {
    args: {
        monitorType: "dns",
    },
    render: (storyArgs) => <DynamicMonitorFieldsStory {...storyArgs} />,
};

export const UnknownMonitorType: Story = {
    args: {
        monitorType: "unregistered" as MonitorType,
    },
};
