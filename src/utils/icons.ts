/**
 * Centralized icon system using react-icons.
 *
 * @remarks
 * Provides a consistent, type-safe way to use icons throughout the application.
 * All icons are sourced from `react-icons` to ensure visual consistency and
 * reduce bundle size compared to inline SVG or emoji.
 *
 * @public
 */

import type { IconType } from "react-icons";

import { BiCheckCircle, BiServer } from "react-icons/bi";
import {
    BsActivity,
    BsCheckCircle,
    BsClockHistory,
    BsCloud,
    BsCollectionPlay,
    BsExclamationTriangle,
    BsGearFill,
    BsGrid3X3Gap,
    BsLightningCharge,
    BsList,
    BsMoonStars,
    BsPauseFill,
    BsSpeedometer,
    BsSunFill,
    BsXCircle,
} from "react-icons/bs";
import {
    FiCopy,
    FiDownload,
    FiEdit,
    FiExternalLink,
    FiFilter,
    FiInbox,
    FiList,
    FiRefreshCw,
    FiSave,
    FiSearch,
    FiSliders,
    FiSquare,
    FiTrash2,
    FiUpload,
    FiVolume2,
    FiX,
} from "react-icons/fi";
import { GoPulse } from "react-icons/go";
import {
    HiMiniChevronDown,
    HiMiniChevronLeft,
    HiMiniChevronRight,
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
    HiOutlineLockClosed,
    HiOutlineLockOpen,
    HiOutlineSquares2X2,
    HiOutlineViewColumns,
} from "react-icons/hi2";
import { IoAdd, IoGlobeOutline } from "react-icons/io5";
import { MdCheckCircle, MdError, MdWarning } from "react-icons/md";
import {
    RiCheckboxCircleFill,
    RiErrorWarningFill,
    RiPauseCircleFill,
    RiPlayCircleFill,
    RiStackLine,
} from "react-icons/ri";
import { SiDropbox, SiGoogledrive } from "react-icons/si";
import {
    TbLayoutCards,
    TbLayoutGrid,
    TbLayoutList,
    TbRefresh,
} from "react-icons/tb";
import { VscDatabase } from "react-icons/vsc";

/**
 * Icon categories for semantic organization.
 *
 * @public
 */
export const AppIcons: {
    readonly actions: {
        readonly add: IconType;
        readonly checkNow: IconType;
        readonly copy: IconType;
        readonly download: IconType;
        readonly edit: IconType;
        readonly filter: IconType;
        readonly pause: IconType;
        readonly pauseFilled: IconType;
        readonly play: IconType;
        readonly playAll: IconType;
        readonly playFilled: IconType;
        readonly refresh: IconType;
        readonly refreshAlt: IconType;
        readonly remove: IconType;
        readonly save: IconType;
        readonly search: IconType;
        readonly stop: IconType;
        readonly upload: IconType;
    };
    readonly brands: {
        readonly dropbox: IconType;
        readonly googleDrive: IconType;
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
        readonly performance: IconType;
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
        readonly cloud: IconType;
        readonly collapse: IconType;
        readonly database: IconType;
        readonly expand: IconType;
        readonly external: IconType;
        readonly history: IconType;
        readonly home: IconType;
        readonly inbox: IconType;
        readonly info: IconType;
        readonly link: IconType;
        readonly lock: IconType;
        readonly monitor: IconType;
        readonly sidebarCollapse: IconType;
        readonly sidebarExpand: IconType;
        readonly site: IconType;
        readonly sliders: IconType;
        readonly unlock: IconType;
        readonly volume: IconType;
    };
} = {
    /** Action icons */
    actions: {
        add: IoAdd,
        checkNow: HiOutlineArrowPath,
        copy: FiCopy,
        download: FiDownload,
        edit: FiEdit,
        filter: FiFilter,
        pause: HiMiniPause,
        pauseFilled: RiPauseCircleFill,
        play: HiMiniPlay,
        playAll: BsCollectionPlay,
        playFilled: RiPlayCircleFill,
        refresh: FiRefreshCw,
        refreshAlt: TbRefresh,
        remove: FiTrash2,
        save: FiSave,
        search: FiSearch,
        stop: FiSquare,
        upload: FiUpload,
    },

    /** Provider / brand icons */
    brands: {
        dropbox: SiDropbox,
        googleDrive: SiGoogledrive,
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
        performance: BsLightningCharge,
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
        cloud: BsCloud,
        collapse: HiMiniChevronUp,
        database: VscDatabase,
        expand: HiMiniChevronDown,
        external: HiOutlineArrowTopRightOnSquare,
        history: HiOutlineClock,
        home: HiOutlineHome,
        inbox: FiInbox,
        info: HiOutlineInformationCircle,
        link: FiExternalLink,
        lock: HiOutlineLockClosed,
        monitor: GoPulse,
        sidebarCollapse: HiMiniChevronLeft,
        sidebarExpand: HiMiniChevronRight,
        site: IoGlobeOutline,
        sliders: FiSliders,
        unlock: HiOutlineLockOpen,
        volume: FiVolume2,
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
 * @param category - Icon category.
 * @param name - Icon name within category.
 *
 * @returns Icon component from `react-icons`.
 *
 * @public
 */
export function getIcon<
    TCategory extends keyof typeof AppIcons,
    TName extends keyof (typeof AppIcons)[TCategory],
>(category: TCategory, name: TName): (typeof AppIcons)[TCategory][TName] {
    return AppIcons[category][name];
}

/**
 * Common icon size presets in pixels.
 *
 * @public
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
 *
 * @public
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
 * @param size - Icon size key.
 *
 * @returns Pixel value.
 *
 * @public
 */
export function getIconSize(size: IconSize): number {
    return IconSizes[size];
}
