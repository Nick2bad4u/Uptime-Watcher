/**
 * Centralized icon system using react-icons.
 *
 * @remarks
 * This module provides a consistent, type-safe way to use icons throughout the
 * application. All icons are sourced from react-icons to ensure visual
 * consistency and reduce bundle size compared to using emoji.
 *
 * @packageDocumentation
 */

import type { IconType } from "react-icons";

import { BiCheckCircle, BiServer } from "react-icons/bi";
import {
    BsActivity,
    BsCheckCircle,
    BsClockHistory,
    BsExclamationTriangle,
    BsGearFill,
    BsGrid3X3Gap,
    BsList,
    BsMoonStars,
    BsPauseFill,
    BsSpeedometer,
    BsSunFill,
    BsXCircle,
} from "react-icons/bs";
import {
    FiDownload,
    FiExternalLink,
    FiList,
    FiRefreshCw,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import {
    HiMiniChevronDown,
    HiMiniChevronUp,
    HiMiniPause,
    HiMiniPlay,
    HiOutlineArrowPath,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineBellAlert,
    HiOutlineChartBar,
    HiOutlineClock,
    HiOutlineCog6Tooth,
    HiOutlineHome,
    HiOutlineInformationCircle,
    HiOutlineSquares2X2,
    HiOutlineViewColumns,
} from "react-icons/hi2";
import { IoAdd } from "react-icons/io5";
import { MdCheckCircle, MdError, MdPlayArrow, MdWarning } from "react-icons/md";
import {
    RiCheckboxCircleFill,
    RiErrorWarningFill,
    RiPauseCircleFill,
    RiPlayCircleFill,
    RiStackLine,
} from "react-icons/ri";
import {
    TbLayoutCards,
    TbLayoutGrid,
    TbLayoutList,
    TbRefresh,
} from "react-icons/tb";
import { VscDatabase } from "react-icons/vsc";

/**
 * Icon categories for semantic organization.
 */
export const AppIcons: {
    readonly actions: {
        readonly add: IconType;
        readonly checkNow: IconType;
        readonly download: IconType;
        readonly pause: IconType;
        readonly pauseFilled: IconType;
        readonly play: IconType;
        readonly playAll: IconType;
        readonly playFilled: IconType;
        readonly refresh: IconType;
        readonly refreshAlt: IconType;
        readonly remove: IconType;
    };
    readonly layout: {
        readonly cards: IconType;
        readonly compact: IconType;
        readonly grid: IconType;
        readonly gridAlt: IconType;
        readonly list: IconType;
        readonly listAlt: IconType;
        readonly stacked: IconType;
        readonly table: IconType;
        readonly viewColumns: IconType;
    };
    readonly metrics: {
        readonly activity: IconType;
        readonly incidents: IconType;
        readonly monitor: IconType;
        readonly response: IconType;
        readonly time: IconType;
        readonly uptime: IconType;
    };
    readonly settings: {
        readonly gear: IconType;
        readonly gearFilled: IconType;
    };
    readonly status: {
        readonly down: IconType;
        readonly downFilled: IconType;
        readonly paused: IconType;
        readonly pausedFilled: IconType;
        readonly pending: IconType;
        readonly pendingFilled: IconType;
        readonly up: IconType;
        readonly upAlt: IconType;
        readonly upFilled: IconType;
        readonly warning: IconType;
    };
    readonly theme: {
        readonly dark: IconType;
        readonly light: IconType;
    };
    readonly ui: {
        readonly analytics: IconType;
        readonly bell: IconType;
        readonly close: IconType;
        readonly collapse: IconType;
        readonly database: IconType;
        readonly expand: IconType;
        readonly external: IconType;
        readonly history: IconType;
        readonly home: IconType;
        readonly info: IconType;
        readonly link: IconType;
    };
} = {
    /** Action icons */
    actions: {
        add: IoAdd,
        checkNow: HiOutlineArrowPath,
        download: FiDownload,
        pause: HiMiniPause,
        pauseFilled: RiPauseCircleFill,
        play: HiMiniPlay,
        playAll: MdPlayArrow,
        playFilled: RiPlayCircleFill,
        refresh: FiRefreshCw,
        refreshAlt: TbRefresh,
        remove: FiTrash2,
    },

    /** Layout and view icons */
    layout: {
        cards: TbLayoutCards,
        compact: BsGrid3X3Gap,
        grid: TbLayoutGrid,
        gridAlt: HiOutlineSquares2X2,
        list: TbLayoutList,
        listAlt: FiList,
        stacked: RiStackLine,
        table: BsList,
        viewColumns: HiOutlineViewColumns,
    },

    /** Monitoring and metrics icons */
    metrics: {
        activity: BsActivity,
        incidents: RiErrorWarningFill,
        monitor: BiServer,
        response: BsSpeedometer,
        time: BsClockHistory,
        uptime: BsCheckCircle,
    },

    /** Settings and configuration */
    settings: {
        gear: HiOutlineCog6Tooth,
        gearFilled: BsGearFill,
    },

    /** Status indicators */
    status: {
        down: BsXCircle,
        downFilled: MdError,
        paused: BsPauseFill,
        pausedFilled: RiPauseCircleFill,
        pending: BsClockHistory,
        pendingFilled: MdWarning,
        up: BiCheckCircle,
        upAlt: MdCheckCircle,
        upFilled: RiCheckboxCircleFill,
        warning: BsExclamationTriangle,
    },

    /** Theme toggle */
    theme: {
        dark: BsMoonStars,
        light: BsSunFill,
    },

    /** General purpose UI icons */
    ui: {
        analytics: HiOutlineChartBar,
        bell: HiOutlineBellAlert,
        close: FiX,
        collapse: HiMiniChevronUp,
        database: VscDatabase,
        expand: HiMiniChevronDown,
        external: HiOutlineArrowTopRightOnSquare,
        history: HiOutlineClock,
        home: HiOutlineHome,
        info: HiOutlineInformationCircle,
        link: FiExternalLink,
    },
} as const;

/**
 * Type-safe icon getter function.
 *
 * @example
 *
 * ```tsx
 * const RefreshIcon = getIcon("actions", "refresh");
 * <RefreshIcon size={20} />;
 * ```
 *
 * @param category - Icon category
 * @param name - Icon name within category
 *
 * @returns Icon component from react-icons
 */
export function getIcon<
    TCategory extends keyof typeof AppIcons,
    TName extends keyof (typeof AppIcons)[TCategory],
>(category: TCategory, name: TName): (typeof AppIcons)[TCategory][TName] {
    return AppIcons[category][name];
}

/**
 * Common icon size presets in pixels.
 */
export const IconSizes = {
    lg: 24,
    md: 20,
    sm: 16,
    xl: 32,
    xs: 12,
    xxl: 40,
} as const;

/**
 * Type for icon size keys.
 */
export type IconSize = keyof typeof IconSizes;

/**
 * Get numeric pixel value for an icon size.
 *
 * @example
 *
 * ```tsx
 * <Icon size={getIconSize("md")} />;
 * ```
 *
 * @param size - Icon size key
 *
 * @returns Pixel value
 */
export function getIconSize(size: IconSize): number {
    return IconSizes[size];
}
