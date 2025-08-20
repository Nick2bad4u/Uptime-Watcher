/**
 * Performance benchmarks for React List Operations Tests the performance of
 * list rendering, sorting, filtering, pagination, and virtualization
 */

import { bench, describe } from "vitest";

// Interface definitions for List Operations
interface ListItem {
    id: string | number;
    value: any;
    metadata: ItemMetadata;
    renderProps: RenderProps;
    state: ItemState;
}

interface ItemMetadata {
    created: number;
    modified: number;
    tags: string[];
    category: string;
    priority: number;
    size: number;
    complexity: number;
}

interface RenderProps {
    key: string | number;
    className?: string;
    style?: Record<string, any>;
    eventHandlers: Record<string, Function>;
    children?: ReactListElement[];
}

interface ItemState {
    selected: boolean;
    visible: boolean;
    expanded: boolean;
    loading: boolean;
    error?: string;
    cached: boolean;
}

interface ReactListElement {
    type: string;
    props: Record<string, any>;
    children: ReactListElement[];
    key: string | number;
    size: number;
    depth: number;
    renderTime: number;
    memoryUsage: number;
}

interface ListOperationConfig {
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    filterCriteria?: FilterCriteria[];
    pagination?: PaginationConfig;
    virtualization?: VirtualizationConfig;
    grouping?: GroupingConfig;
    selection?: SelectionConfig;
}

interface FilterCriteria {
    field: string;
    operator: FilterOperator;
    value: any;
    weight: number;
}

interface PaginationConfig {
    page: number;
    pageSize: number;
    totalItems: number;
    prefetchPages: number;
}

interface VirtualizationConfig {
    itemHeight: number | ((index: number) => number);
    containerHeight: number;
    overscan: number;
    scrollOffset: number;
    estimatedItemSize?: number;
}

interface GroupingConfig {
    groupBy: string;
    sortGroups: boolean;
    collapseGroups: boolean;
    groupHeaderRenderer?: (
        group: string,
        items: ListItem[]
    ) => ReactListElement;
}

interface SelectionConfig {
    mode: SelectionMode;
    selectedItems: Set<string | number>;
    onSelectionChange: (selected: Set<string | number>) => void;
    selectableFilter?: (item: ListItem) => boolean;
}

interface ListPerformanceMetrics {
    totalItems: number;
    renderedItems: number;
    totalRenderTime: number;
    averageItemRenderTime: number;
    memoryUsage: number;
    filterTime: number;
    sortTime: number;
    paginationTime: number;
    virtualizationEfficiency: number;
    cacheHitRate: number;
}

type GroupedItems = Record<
    string,
    {
        items: ListItem[];
        header: ReactListElement;
        collapsed: boolean;
        totalSize: number;
    }
>;

type FilterOperator =
    | "equals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan"
    | "between"
    | "in";
type SelectionMode = "none" | "single" | "multiple" | "range";
type SortDirection = "asc" | "desc";

// Mock React List Renderer
class MockReactListRenderer {
    private components = new Map<string, ListRenderingContext>();
    private elementFactory = new MockListElementFactory();
    private virtualizer = new ListVirtualizer();
    private sorter = new ListSorter();
    private filterer = new ListFilterer();
    private paginator = new ListPaginator();
    private grouper = new ListGrouper();
    private selector = new ListSelector();
    private cache = new ListRenderCache();
    private performanceAnalyzer = new ListPerformanceAnalyzer();

    // Component registration
    registerListComponent(componentId: string): ListRenderingContext {
        const context: ListRenderingContext = {
            componentId,
            items: [],
            renderedElements: [],
            config: {},
            metrics: this.initializeMetrics(),
            renderHistory: [],
            cacheState: new Map(),
            selectionState: new Set(),
        };

        this.components.set(componentId, context);
        return context;
    }

    // Core list rendering methods
    renderList(
        componentId: string,
        items: ListItem[],
        config: ListOperationConfig = {}
    ): ReactListElement[] {
        const startTime = performance.now();
        const context = this.getContext(componentId);

        // Update context
        context.items = items;
        context.config = config;

        // Apply operations in sequence
        let processedItems = [...items];

        // 1. Filtering
        if (config.filterCriteria && config.filterCriteria.length > 0) {
            const filterStart = performance.now();
            processedItems = this.filterer.filterItems(
                processedItems,
                config.filterCriteria
            );
            context.metrics.filterTime += performance.now() - filterStart;
        }

        // 2. Sorting
        if (config.sortBy) {
            const sortStart = performance.now();
            processedItems = this.sorter.sortItems(
                processedItems,
                config.sortBy,
                config.sortDirection || "asc"
            );
            context.metrics.sortTime += performance.now() - sortStart;
        }

        // 3. Grouping
        let groupedItems: GroupedItems | null = null;
        if (config.grouping) {
            groupedItems = this.grouper.groupItems(
                processedItems,
                config.grouping
            );
        }

        // 4. Pagination
        let paginatedItems = processedItems;
        if (config.pagination) {
            const paginationStart = performance.now();
            paginatedItems = this.paginator.paginateItems(
                processedItems,
                config.pagination
            );
            context.metrics.paginationTime +=
                performance.now() - paginationStart;
        }

        // 5. Virtualization
        let virtualizedItems = paginatedItems;
        if (config.virtualization) {
            virtualizedItems = this.virtualizer.getVisibleItems(
                paginatedItems,
                config.virtualization
            );
            context.metrics.virtualizationEfficiency =
                virtualizedItems.length / paginatedItems.length;
        }

        // 6. Render elements
        const renderedElements = this.renderItems(
            context,
            virtualizedItems,
            groupedItems
        );

        // Update metrics
        const totalRenderTime = performance.now() - startTime;
        this.updateRenderMetrics(context, totalRenderTime, renderedElements);

        context.renderedElements = renderedElements;
        context.renderHistory.push({
            timestamp: Date.now(),
            itemCount: items.length,
            renderTime: totalRenderTime,
            config: { ...config },
        });

        return renderedElements;
    }

    // Specialized rendering methods
    renderVirtualizedList(
        componentId: string,
        items: ListItem[],
        virtualizationConfig: VirtualizationConfig
    ): {
        elements: ReactListElement[];
        virtualHeight: number;
        scrollMetrics: any;
    } {
        const startTime = performance.now();
        const context = this.getContext(componentId);

        // Calculate visible range
        const visibleRange = this.virtualizer.calculateVisibleRange(
            items,
            virtualizationConfig
        );
        const visibleItems = items.slice(visibleRange.start, visibleRange.end);

        // Render only visible items
        const elements = visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            return this.elementFactory.createListItemElement(
                item,
                actualIndex,
                this.calculateItemHeight(
                    virtualizationConfig.itemHeight,
                    actualIndex
                )
            );
        });

        // Calculate virtual height and scroll metrics
        const virtualHeight = this.virtualizer.calculateTotalHeight(
            items,
            virtualizationConfig
        );
        const scrollMetrics = this.virtualizer.getScrollMetrics(
            visibleRange,
            virtualizationConfig
        );

        const renderTime = performance.now() - startTime;
        context.metrics.totalRenderTime += renderTime;
        context.metrics.renderedItems = elements.length;
        context.metrics.virtualizationEfficiency =
            elements.length / items.length;

        return { elements, virtualHeight, scrollMetrics };
    }

    renderGroupedList(
        componentId: string,
        items: ListItem[],
        groupingConfig: GroupingConfig
    ): ReactListElement[] {
        const startTime = performance.now();
        const context = this.getContext(componentId);

        const groupedItems = this.grouper.groupItems(items, groupingConfig);
        const elements: ReactListElement[] = [];

        Object.entries(groupedItems).forEach(([groupKey, group]) => {
            // Render group header
            const headerElement = group.header;
            elements.push(headerElement);

            // Render group items (if not collapsed)
            if (!group.collapsed) {
                const groupItemElements = group.items.map((item, index) =>
                    this.elementFactory.createListItemElement(
                        item,
                        index,
                        undefined,
                        {
                            grouped: true,
                            groupKey,
                            indexInGroup: index,
                        }
                    )
                );
                elements.push(...groupItemElements);
            }
        });

        const renderTime = performance.now() - startTime;
        this.updateRenderMetrics(context, renderTime, elements);

        return elements;
    }

    renderSelectableList(
        componentId: string,
        items: ListItem[],
        selectionConfig: SelectionConfig
    ): ReactListElement[] {
        const startTime = performance.now();
        const context = this.getContext(componentId);

        context.selectionState = new Set(selectionConfig.selectedItems);

        const elements = items.map((item, index) => {
            const isSelectable = selectionConfig.selectableFilter
                ? selectionConfig.selectableFilter(item)
                : true;
            const isSelected = context.selectionState.has(item.id);

            return this.elementFactory.createSelectableListItem(
                item,
                index,
                isSelected,
                isSelectable,
                (selected: boolean) =>
                    this.handleItemSelection(
                        context,
                        item,
                        selected,
                        selectionConfig
                    )
            );
        });

        const renderTime = performance.now() - startTime;
        this.updateRenderMetrics(context, renderTime, elements);

        return elements;
    }

    // Advanced list operations
    renderInfiniteScrollList(
        componentId: string,
        items: ListItem[],
        config: {
            itemHeight: number;
            threshold: number;
            loadMore: () => Promise<ListItem[]>;
            hasMore: boolean;
        }
    ): ReactListElement[] {
        const context = this.getContext(componentId);
        const elements: ReactListElement[] = [];

        // Render existing items
        items.forEach((item, index) => {
            const element = this.elementFactory.createListItemElement(
                item,
                index
            );
            elements.push(element);
        });

        // Add loading indicator if there are more items
        if (config.hasMore) {
            const loadingElement = this.elementFactory.createElement(
                "InfiniteScrollLoader",
                {
                    onIntersect: config.loadMore,
                    threshold: config.threshold,
                },
                []
            );
            elements.push(loadingElement);
        }

        // Add sentinel element for scroll detection
        const sentinelElement = this.elementFactory.createElement(
            "InfiniteScrollSentinel",
            {
                onVisible: () =>
                    this.handleInfiniteScrollTrigger(componentId, config),
            },
            []
        );
        elements.push(sentinelElement);

        return elements;
    }

    renderMasonryList(
        componentId: string,
        items: ListItem[],
        config: {
            columnCount: number;
            gap: number;
            estimateItemHeight: (item: ListItem) => number;
        }
    ): ReactListElement[] {
        const startTime = performance.now();
        const context = this.getContext(componentId);

        // Calculate column layout
        const layout = this.calculateMasonryLayout(items, config);
        const elements: ReactListElement[] = [];

        layout.columns.forEach((column, columnIndex) => {
            const columnElement = this.elementFactory.createElement(
                "MasonryColumn",
                {
                    index: columnIndex,
                    style: {
                        width: `${100 / config.columnCount}%`,
                        paddingRight: `${config.gap}px`,
                    },
                },
                column.items.map((item, itemIndex) =>
                    this.elementFactory.createListItemElement(
                        item,
                        itemIndex,
                        column.heights[itemIndex]
                    )
                )
            );
            elements.push(columnElement);
        });

        const renderTime = performance.now() - startTime;
        this.updateRenderMetrics(context, renderTime, elements);

        return elements;
    }

    // Performance optimization methods
    renderWithMemoization(
        componentId: string,
        items: ListItem[],
        config: ListOperationConfig,
        dependencies: any[]
    ): ReactListElement[] {
        const context = this.getContext(componentId);
        const cacheKey = this.generateCacheKey(items, config, dependencies);

        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached) {
            context.metrics.cacheHitRate =
                (context.metrics.cacheHitRate * context.renderHistory.length +
                    1) /
                (context.renderHistory.length + 1);
            return cached.elements;
        }

        // Render and cache
        const elements = this.renderList(componentId, items, config);
        this.cache.set(cacheKey, {
            elements: elements.map((el) => ({ ...el })), // Deep copy
            timestamp: Date.now(),
            dependencies: [...dependencies],
        });

        return elements;
    }

    renderWithLazyLoading(
        componentId: string,
        items: ListItem[],
        config: {
            threshold: number;
            placeholderHeight: number;
            loadContent: (item: ListItem) => Promise<ReactListElement>;
        }
    ): ReactListElement[] {
        const context = this.getContext(componentId);
        const elements: ReactListElement[] = [];

        items.forEach((item, index) => {
            if (item.state.loading) {
                // Show placeholder
                const placeholder = this.elementFactory.createElement(
                    "LazyPlaceholder",
                    {
                        height: config.placeholderHeight,
                        onIntersect: () =>
                            this.loadLazyContent(
                                componentId,
                                item,
                                config.loadContent
                            ),
                    },
                    []
                );
                elements.push(placeholder);
            } else if (item.state.cached) {
                // Show cached content
                const cachedElement = this.cache.getLazyContent(item.id);
                if (cachedElement) {
                    elements.push(cachedElement);
                }
            } else {
                // Show regular content
                const element = this.elementFactory.createListItemElement(
                    item,
                    index
                );
                elements.push(element);
            }
        });

        return elements;
    }

    // Utility methods
    private renderItems(
        context: ListRenderingContext,
        items: ListItem[],
        groupedItems: GroupedItems | null
    ): ReactListElement[] {
        if (groupedItems) {
            return this.renderGroupedItems(groupedItems);
        }

        return items.map((item, index) =>
            this.elementFactory.createListItemElement(item, index)
        );
    }

    private renderGroupedItems(groupedItems: GroupedItems): ReactListElement[] {
        const elements: ReactListElement[] = [];

        Object.entries(groupedItems).forEach(([groupKey, group]) => {
            elements.push(group.header);
            if (!group.collapsed) {
                elements.push(
                    ...group.items.map((item, index) =>
                        this.elementFactory.createListItemElement(item, index)
                    )
                );
            }
        });

        return elements;
    }

    private calculateItemHeight(
        itemHeight: number | ((index: number) => number),
        index: number
    ): number {
        return typeof itemHeight === "function"
            ? itemHeight(index)
            : itemHeight;
    }

    private calculateMasonryLayout(
        items: ListItem[],
        config: {
            columnCount: number;
            gap: number;
            estimateItemHeight: (item: ListItem) => number;
        }
    ): { columns: { items: ListItem[]; heights: number[] }[] } {
        const columns = Array.from({ length: config.columnCount }, () => ({
            items: [] as ListItem[],
            heights: [] as number[],
            totalHeight: 0,
        }));

        items.forEach((item) => {
            // Find column with minimum height
            const targetColumn = columns.reduce((minColumn, column) =>
                column.totalHeight < minColumn.totalHeight ? column : minColumn
            );

            const itemHeight = config.estimateItemHeight(item);
            targetColumn.items.push(item);
            targetColumn.heights.push(itemHeight);
            targetColumn.totalHeight += itemHeight + config.gap;
        });

        return { columns };
    }

    private handleItemSelection(
        context: ListRenderingContext,
        item: ListItem,
        selected: boolean,
        config: SelectionConfig
    ): void {
        const newSelection = new Set(context.selectionState);

        if (config.mode === "single") {
            if (selected) {
                newSelection.clear();
                newSelection.add(item.id);
            } else {
                newSelection.delete(item.id);
            }
        } else if (config.mode === "multiple") {
            if (selected) {
                newSelection.add(item.id);
            } else {
                newSelection.delete(item.id);
            }
        }

        context.selectionState = newSelection;
        config.onSelectionChange(newSelection);
    }

    private handleInfiniteScrollTrigger(
        componentId: string,
        config: { loadMore: () => Promise<ListItem[]>; hasMore: boolean }
    ): void {
        if (config.hasMore) {
            config.loadMore().then((newItems) => {
                const context = this.getContext(componentId);
                context.items.push(...newItems);
            });
        }
    }

    private async loadLazyContent(
        componentId: string,
        item: ListItem,
        loadContent: (item: ListItem) => Promise<ReactListElement>
    ): Promise<void> {
        item.state.loading = true;

        try {
            const content = await loadContent(item);
            this.cache.setLazyContent(item.id, content);
            item.state.cached = true;
            item.state.loading = false;
        } catch (error) {
            item.state.error = (error as Error).message;
            item.state.loading = false;
        }
    }

    private generateCacheKey(
        items: ListItem[],
        config: ListOperationConfig,
        dependencies: any[]
    ): string {
        const itemsHash =
            items.length +
            items.reduce((sum, item) => sum + item.id.toString().length, 0);
        const configHash = JSON.stringify(config);
        const depsHash = dependencies
            .map((dep) => JSON.stringify(dep))
            .join("|");

        return `${itemsHash}-${configHash.length}-${depsHash.length}`;
    }

    private updateRenderMetrics(
        context: ListRenderingContext,
        renderTime: number,
        elements: ReactListElement[]
    ): void {
        context.metrics.totalRenderTime += renderTime;
        context.metrics.renderedItems = elements.length;
        context.metrics.averageItemRenderTime =
            elements.length > 0 ? renderTime / elements.length : 0;
        context.metrics.memoryUsage += elements.reduce(
            (sum, el) => sum + el.memoryUsage,
            0
        );
    }

    private initializeMetrics(): ListPerformanceMetrics {
        return {
            totalItems: 0,
            renderedItems: 0,
            totalRenderTime: 0,
            averageItemRenderTime: 0,
            memoryUsage: 0,
            filterTime: 0,
            sortTime: 0,
            paginationTime: 0,
            virtualizationEfficiency: 1,
            cacheHitRate: 0,
        };
    }

    private getContext(componentId: string): ListRenderingContext {
        const context = this.components.get(componentId);
        if (!context) {
            throw new Error(`Component ${componentId} not found`);
        }
        return context;
    }

    // Performance analysis
    analyzeListPerformance(): any {
        const allContexts = Array.from(this.components.values());
        const totalComponents = allContexts.length;

        const aggregatedMetrics = allContexts.reduce((acc, context) => {
            acc.totalItems += context.metrics.totalItems;
            acc.renderedItems += context.metrics.renderedItems;
            acc.totalRenderTime += context.metrics.totalRenderTime;
            acc.memoryUsage += context.metrics.memoryUsage;
            acc.filterTime += context.metrics.filterTime;
            acc.sortTime += context.metrics.sortTime;
            acc.paginationTime += context.metrics.paginationTime;
            return acc;
        }, this.initializeMetrics());

        return {
            totalComponents,
            averageItemsPerComponent:
                totalComponents > 0
                    ? aggregatedMetrics.totalItems / totalComponents
                    : 0,
            averageRenderTime:
                totalComponents > 0
                    ? aggregatedMetrics.totalRenderTime / totalComponents
                    : 0,
            totalMemoryUsage: aggregatedMetrics.memoryUsage,
            operationTimes: {
                filtering: aggregatedMetrics.filterTime,
                sorting: aggregatedMetrics.sortTime,
                pagination: aggregatedMetrics.paginationTime,
            },
        };
    }

    // Cleanup
    reset(): void {
        this.components.clear();
        this.cache.clear();
    }
}

// Supporting classes (simplified implementations)
interface ListRenderingContext {
    componentId: string;
    items: ListItem[];
    renderedElements: ReactListElement[];
    config: ListOperationConfig;
    metrics: ListPerformanceMetrics;
    renderHistory: {
        timestamp: number;
        itemCount: number;
        renderTime: number;
        config: ListOperationConfig;
    }[];
    cacheState: Map<string, any>;
    selectionState: Set<string | number>;
}

class MockListElementFactory {
    private elementId = 0;

    createElement(
        type: string,
        props: Record<string, any>,
        children: ReactListElement[]
    ): ReactListElement {
        return {
            type,
            props: { ...props },
            children: [...children],
            key: this.elementId++,
            size: this.calculateElementSize(type, props, children),
            depth: this.calculateDepth(children),
            renderTime: Math.random() * 2,
            memoryUsage: this.calculateMemoryUsage(type, props, children),
        };
    }

    createListItemElement(
        item: ListItem,
        index: number,
        height?: number,
        extraProps?: Record<string, any>
    ): ReactListElement {
        const props = {
            item,
            index,
            height,
            ...extraProps,
            ...item.renderProps,
        };

        const children = item.renderProps.children || [];

        return this.createElement("ListItem", props, children);
    }

    createSelectableListItem(
        item: ListItem,
        index: number,
        isSelected: boolean,
        isSelectable: boolean,
        onSelectionChange: (selected: boolean) => void
    ): ReactListElement {
        const props = {
            item,
            index,
            isSelected,
            isSelectable,
            onSelectionChange,
            className: `list-item ${isSelected ? "selected" : ""} ${isSelectable ? "selectable" : "disabled"}`,
        };

        return this.createElement("SelectableListItem", props, []);
    }

    private calculateElementSize(
        type: string,
        props: Record<string, any>,
        children: ReactListElement[]
    ): number {
        let size = type.length * 2;
        size += Object.keys(props).length * 10;
        size += children.reduce((sum, child) => sum + child.size, 0);
        return size;
    }

    private calculateDepth(children: ReactListElement[]): number {
        if (children.length === 0) return 1;
        return 1 + Math.max(...children.map((child) => child.depth));
    }

    private calculateMemoryUsage(
        type: string,
        props: Record<string, any>,
        children: ReactListElement[]
    ): number {
        let usage = 100; // Base overhead
        usage += Object.keys(props).length * 50;
        usage += children.reduce((sum, child) => sum + child.memoryUsage, 0);
        return usage;
    }
}

class ListVirtualizer {
    calculateVisibleRange(
        items: ListItem[],
        config: VirtualizationConfig
    ): { start: number; end: number } {
        const scrollTop = config.scrollOffset;
        const containerHeight = config.containerHeight;
        const overscan = config.overscan;

        let start = 0;
        let end = items.length;

        if (typeof config.itemHeight === "number") {
            start = Math.floor(scrollTop / config.itemHeight);
            end = Math.min(
                start +
                    Math.ceil(containerHeight / config.itemHeight) +
                    overscan,
                items.length
            );
        } else {
            // Variable height calculation (simplified)
            let accumulatedHeight = 0;
            for (let i = 0; i < items.length; i++) {
                const itemHeight = config.itemHeight(i);
                if (accumulatedHeight + itemHeight > scrollTop) {
                    start = Math.max(0, i - overscan);
                    break;
                }
                accumulatedHeight += itemHeight;
            }

            accumulatedHeight = 0;
            for (let i = start; i < items.length; i++) {
                const itemHeight = config.itemHeight(i);
                accumulatedHeight += itemHeight;
                if (
                    accumulatedHeight >
                    containerHeight +
                        overscan * (config.estimatedItemSize || 50)
                ) {
                    end = i + 1;
                    break;
                }
            }
        }

        return { start: Math.max(0, start), end: Math.min(end, items.length) };
    }

    calculateTotalHeight(
        items: ListItem[],
        config: VirtualizationConfig
    ): number {
        if (typeof config.itemHeight === "number") {
            return items.length * config.itemHeight;
        }

        return items.reduce(
            (total, _, index) => total + (config.itemHeight as Function)(index),
            0
        );
    }

    getVisibleItems(
        items: ListItem[],
        config: VirtualizationConfig
    ): ListItem[] {
        const range = this.calculateVisibleRange(items, config);
        return items.slice(range.start, range.end);
    }

    getScrollMetrics(
        visibleRange: { start: number; end: number },
        config: VirtualizationConfig
    ): any {
        return {
            visibleStart: visibleRange.start,
            visibleEnd: visibleRange.end,
            scrollOffset: config.scrollOffset,
            containerHeight: config.containerHeight,
            overscan: config.overscan,
        };
    }
}

class ListSorter {
    sortItems(
        items: ListItem[],
        sortBy: string,
        direction: SortDirection
    ): ListItem[] {
        const multiplier = direction === "asc" ? 1 : -1;

        return [...items].sort((a, b) => {
            const aValue = this.getNestedValue(a, sortBy);
            const bValue = this.getNestedValue(b, sortBy);

            if (aValue === bValue) return 0;
            if (aValue === null) return 1;
            if (bValue === null) return -1;

            if (typeof aValue === "string" && typeof bValue === "string") {
                return aValue.localeCompare(bValue) * multiplier;
            }

            return (aValue < bValue ? -1 : 1) * multiplier;
        });
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    }
}

class ListFilterer {
    filterItems(items: ListItem[], criteria: FilterCriteria[]): ListItem[] {
        return items.filter((item) =>
            criteria.every((criterion) => this.evaluateFilter(item, criterion))
        );
    }

    private evaluateFilter(item: ListItem, criterion: FilterCriteria): boolean {
        const fieldValue = this.getFieldValue(item, criterion.field);

        switch (criterion.operator) {
            case "equals": {
                return fieldValue === criterion.value;
            }
            case "contains": {
                return String(fieldValue)
                    .toLowerCase()
                    .includes(String(criterion.value).toLowerCase());
            }
            case "startsWith": {
                return String(fieldValue)
                    .toLowerCase()
                    .startsWith(String(criterion.value).toLowerCase());
            }
            case "endsWith": {
                return String(fieldValue)
                    .toLowerCase()
                    .endsWith(String(criterion.value).toLowerCase());
            }
            case "greaterThan": {
                return Number(fieldValue) > Number(criterion.value);
            }
            case "lessThan": {
                return Number(fieldValue) < Number(criterion.value);
            }
            case "between": {
                const [min, max] = Array.isArray(criterion.value)
                    ? criterion.value
                    : [0, 0];
                const numValue = Number(fieldValue);
                return numValue >= min && numValue <= max;
            }
            case "in": {
                return Array.isArray(criterion.value)
                    ? criterion.value.includes(fieldValue)
                    : false;
            }
            default: {
                return true;
            }
        }
    }

    private getFieldValue(item: ListItem, field: string): any {
        return field.split(".").reduce((obj, key) => obj?.[key], item);
    }
}

class ListPaginator {
    paginateItems(items: ListItem[], config: PaginationConfig): ListItem[] {
        const startIndex = (config.page - 1) * config.pageSize;
        const endIndex = startIndex + config.pageSize;
        return items.slice(startIndex, endIndex);
    }
}

class ListGrouper {
    groupItems(items: ListItem[], config: GroupingConfig): GroupedItems {
        const groups: GroupedItems = {};

        items.forEach((item) => {
            const groupKey = this.getGroupKey(item, config.groupBy);

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    items: [],
                    header: this.createGroupHeader(groupKey, [], config),
                    collapsed: config.collapseGroups || false,
                    totalSize: 0,
                };
            }

            groups[groupKey].items.push(item);
            groups[groupKey].totalSize += item.metadata.size;
        });

        // Update headers with final item counts
        Object.entries(groups).forEach(([groupKey, group]) => {
            group.header = this.createGroupHeader(
                groupKey,
                group.items,
                config
            );
        });

        return groups;
    }

    private getGroupKey(item: ListItem, groupBy: string): string {
        const value = groupBy.split(".").reduce((obj, key) => obj?.[key], item);
        return String(value || "undefined");
    }

    private createGroupHeader(
        groupKey: string,
        items: ListItem[],
        config: GroupingConfig
    ): ReactListElement {
        if (config.groupHeaderRenderer) {
            return config.groupHeaderRenderer(groupKey, items);
        }

        return {
            type: "GroupHeader",
            props: {
                groupKey,
                itemCount: items.length,
                collapsed: config.collapseGroups,
            },
            children: [],
            key: `group-${groupKey}`,
            size: 200,
            depth: 1,
            renderTime: 1,
            memoryUsage: 150,
        };
    }
}

class ListSelector {
    updateSelection(
        currentSelection: Set<string | number>,
        item: ListItem,
        selected: boolean,
        mode: SelectionMode
    ): Set<string | number> {
        const newSelection = new Set(currentSelection);

        switch (mode) {
            case "single": {
                if (selected) {
                    newSelection.clear();
                    newSelection.add(item.id);
                } else {
                    newSelection.delete(item.id);
                }
                break;
            }

            case "multiple": {
                if (selected) {
                    newSelection.add(item.id);
                } else {
                    newSelection.delete(item.id);
                }
                break;
            }

            case "range": {
                // Simplified range selection
                if (selected) {
                    newSelection.add(item.id);
                } else {
                    newSelection.delete(item.id);
                }
                break;
            }

            default: {
                // No selection allowed
                break;
            }
        }

        return newSelection;
    }
}

class ListRenderCache {
    private cache = new Map<string, any>();
    private lazyContentCache = new Map<string | number, ReactListElement>();

    get(key: string): any {
        return this.cache.get(key);
    }

    set(key: string, value: any): void {
        this.cache.set(key, value);
    }

    getLazyContent(itemId: string | number): ReactListElement | undefined {
        return this.lazyContentCache.get(itemId);
    }

    setLazyContent(itemId: string | number, content: ReactListElement): void {
        this.lazyContentCache.set(itemId, content);
    }

    clear(): void {
        this.cache.clear();
        this.lazyContentCache.clear();
    }
}

class ListPerformanceAnalyzer {
    analyzeRenderPerformance(contexts: ListRenderingContext[]): any {
        const totalRenderTime = contexts.reduce(
            (sum, ctx) => sum + ctx.metrics.totalRenderTime,
            0
        );
        const totalItems = contexts.reduce(
            (sum, ctx) => sum + ctx.metrics.totalItems,
            0
        );

        return {
            averageRenderTime:
                contexts.length > 0 ? totalRenderTime / contexts.length : 0,
            averageItemsPerRender:
                contexts.length > 0 ? totalItems / contexts.length : 0,
            totalMemoryUsage: contexts.reduce(
                (sum, ctx) => sum + ctx.metrics.memoryUsage,
                0
            ),
            cacheEfficiency:
                contexts.reduce(
                    (sum, ctx) => sum + ctx.metrics.cacheHitRate,
                    0
                ) / contexts.length,
        };
    }
}

describe("React List Operations Performance", () => {
    // Basic list rendering
    bench("simple list rendering", () => {
        const renderer = new MockReactListRenderer();
        const components: string[] = [];

        // Create components
        for (let i = 0; i < 50; i++) {
            const componentId = `simple-list-${i}`;
            renderer.registerListComponent(componentId);
            components.push(componentId);
        }

        // Render lists with varying sizes
        for (let render = 0; render < 200; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];
            const itemCount = 50 + Math.floor(Math.random() * 150);

            const items: ListItem[] = Array.from(
                { length: itemCount },
                (_, index) => ({
                    id: `item-${index}`,
                    value: `Item ${index}`,
                    metadata: {
                        created: Date.now() - Math.random() * 86_400_000,
                        modified: Date.now(),
                        tags: [`tag${index % 5}`, `category${index % 3}`],
                        category: `Category ${index % 5}`,
                        priority: Math.random(),
                        size: 100 + Math.floor(Math.random() * 200),
                        complexity: 1 + Math.floor(Math.random() * 3),
                    },
                    renderProps: {
                        key: `item-${index}`,
                        className: `list-item item-${index % 5}`,
                        eventHandlers: {
                            onClick: () => console.log(`Clicked item ${index}`),
                            onHover: () => console.log(`Hovered item ${index}`),
                        },
                    },
                    state: {
                        selected: false,
                        visible: true,
                        expanded: false,
                        loading: false,
                        cached: false,
                    },
                })
            );

            renderer.renderList(componentId, items);
        }

        renderer.reset();
    });

    // Filtering operations
    bench("list filtering operations", () => {
        const renderer = new MockReactListRenderer();
        const components: string[] = [];

        for (let i = 0; i < 30; i++) {
            const componentId = `filtered-list-${i}`;
            renderer.registerListComponent(componentId);
            components.push(componentId);
        }

        for (let render = 0; render < 150; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];

            // Create a large dataset
            const items: ListItem[] = Array.from(
                { length: 500 },
                (_, index) => ({
                    id: `item-${index}`,
                    value: {
                        name: `Item ${index}`,
                        description: `Description for item ${index}`,
                        price: Math.random() * 1000,
                        rating: Math.random() * 5,
                        inStock: Math.random() > 0.3,
                    },
                    metadata: {
                        created: Date.now() - Math.random() * 86_400_000,
                        modified: Date.now(),
                        tags: [`tag${index % 10}`, `type${index % 7}`],
                        category: `Category ${index % 8}`,
                        priority: Math.random(),
                        size: 150 + Math.floor(Math.random() * 300),
                        complexity: 1 + Math.floor(Math.random() * 5),
                    },
                    renderProps: {
                        key: `item-${index}`,
                        eventHandlers: {},
                    },
                    state: {
                        selected: false,
                        visible: true,
                        expanded: false,
                        loading: false,
                        cached: false,
                    },
                })
            );

            // Apply different filter combinations
            const filterConfigs = [
                // Price filter
                {
                    filterCriteria: [
                        {
                            field: "value.price",
                            operator: "greaterThan" as FilterOperator,
                            value: 500,
                            weight: 1,
                        },
                        {
                            field: "value.inStock",
                            operator: "equals" as FilterOperator,
                            value: true,
                            weight: 1,
                        },
                    ],
                },
                // Text search
                {
                    filterCriteria: [
                        {
                            field: "value.name",
                            operator: "contains" as FilterOperator,
                            value: "Item 1",
                            weight: 1,
                        },
                    ],
                },
                // Complex filter
                {
                    filterCriteria: [
                        {
                            field: "value.rating",
                            operator: "greaterThan" as FilterOperator,
                            value: 3.5,
                            weight: 1,
                        },
                        {
                            field: "metadata.category",
                            operator: "in" as FilterOperator,
                            value: [
                                "Category 1",
                                "Category 3",
                                "Category 5",
                            ],
                            weight: 1,
                        },
                        {
                            field: "value.price",
                            operator: "between" as FilterOperator,
                            value: [100, 800],
                            weight: 1,
                        },
                    ],
                },
            ];

            const config =
                filterConfigs[Math.floor(Math.random() * filterConfigs.length)];
            renderer.renderList(componentId, items, config);
        }

        renderer.reset();
    });

    // Sorting operations
    bench("list sorting operations", () => {
        const renderer = new MockReactListRenderer();
        const components: string[] = [];

        for (let i = 0; i < 25; i++) {
            const componentId = `sorted-list-${i}`;
            renderer.registerListComponent(componentId);
            components.push(componentId);
        }

        for (let render = 0; render < 100; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];

            const items: ListItem[] = Array.from(
                { length: 300 },
                (_, index) => ({
                    id: `item-${index}`,
                    value: {
                        name: `Item ${Math.floor(Math.random() * 1000)}`,
                        timestamp: Date.now() - Math.random() * 86_400_000,
                        score: Math.random() * 100,
                        category: `Category ${index % 5}`,
                    },
                    metadata: {
                        created: Date.now() - Math.random() * 86_400_000 * 30,
                        modified: Date.now() - Math.random() * 86_400_000 * 7,
                        tags: [`tag${index % 12}`],
                        category: `Category ${index % 5}`,
                        priority: Math.random(),
                        size: 100 + Math.floor(Math.random() * 400),
                        complexity: 1 + Math.floor(Math.random() * 4),
                    },
                    renderProps: {
                        key: `item-${index}`,
                        eventHandlers: {},
                    },
                    state: {
                        selected: false,
                        visible: true,
                        expanded: false,
                        loading: false,
                        cached: false,
                    },
                })
            );

            // Different sorting configurations
            const sortConfigs = [
                { sortBy: "value.name", sortDirection: "asc" as SortDirection },
                {
                    sortBy: "value.timestamp",
                    sortDirection: "desc" as SortDirection,
                },
                {
                    sortBy: "value.score",
                    sortDirection: "desc" as SortDirection,
                },
                {
                    sortBy: "metadata.created",
                    sortDirection: "asc" as SortDirection,
                },
                {
                    sortBy: "metadata.priority",
                    sortDirection: "desc" as SortDirection,
                },
            ];

            const config =
                sortConfigs[Math.floor(Math.random() * sortConfigs.length)];
            renderer.renderList(componentId, items, config);
        }

        renderer.reset();
    });

    // Virtualized rendering
    bench("virtualized list rendering", () => {
        const renderer = new MockReactListRenderer();
        const components: string[] = [];

        for (let i = 0; i < 20; i++) {
            const componentId = `virtualized-list-${i}`;
            renderer.registerListComponent(componentId);
            components.push(componentId);
        }

        for (let render = 0; render < 80; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];

            // Large dataset for virtualization
            const items: ListItem[] = Array.from(
                { length: 5000 },
                (_, index) => ({
                    id: `virtual-item-${index}`,
                    value: {
                        content: `Content for item ${index}`,
                        data: Array.from({ length: 20 }, () => Math.random()),
                    },
                    metadata: {
                        created: Date.now(),
                        modified: Date.now(),
                        tags: [`tag${index % 15}`],
                        category: `Category ${index % 10}`,
                        priority: Math.random(),
                        size: 200 + Math.floor(Math.random() * 300),
                        complexity: 1 + Math.floor(Math.random() * 6),
                    },
                    renderProps: {
                        key: `virtual-item-${index}`,
                        eventHandlers: {},
                    },
                    state: {
                        selected: false,
                        visible: true,
                        expanded: false,
                        loading: false,
                        cached: false,
                    },
                })
            );

            // Different virtualization configurations
            const virtualizationConfigs: VirtualizationConfig[] = [
                {
                    itemHeight: 50,
                    containerHeight: 400,
                    overscan: 5,
                    scrollOffset: Math.random() * 10_000,
                },
                {
                    itemHeight: (index: number) => 40 + (index % 5) * 20, // Variable height
                    containerHeight: 600,
                    overscan: 10,
                    scrollOffset: Math.random() * 15_000,
                    estimatedItemSize: 60,
                },
                {
                    itemHeight: 80,
                    containerHeight: 300,
                    overscan: 3,
                    scrollOffset: Math.random() * 20_000,
                },
            ];

            const config =
                virtualizationConfigs[
                    Math.floor(Math.random() * virtualizationConfigs.length)
                ];
            renderer.renderVirtualizedList(componentId, items, config);
        }

        renderer.reset();
    });

    // Grouped list rendering
    bench("grouped list rendering", () => {
        const renderer = new MockReactListRenderer();
        const components: string[] = [];

        for (let i = 0; i < 15; i++) {
            const componentId = `grouped-list-${i}`;
            renderer.registerListComponent(componentId);
            components.push(componentId);
        }

        for (let render = 0; render < 60; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];

            const items: ListItem[] = Array.from(
                { length: 400 },
                (_, index) => ({
                    id: `grouped-item-${index}`,
                    value: {
                        title: `Item ${index}`,
                        department: `Department ${index % 8}`,
                        team: `Team ${index % 15}`,
                        status: [
                            "active",
                            "pending",
                            "completed",
                        ][index % 3],
                    },
                    metadata: {
                        created: Date.now() - Math.random() * 86_400_000 * 30,
                        modified: Date.now(),
                        tags: [`tag${index % 8}`],
                        category: `Category ${index % 6}`,
                        priority: Math.random(),
                        size: 120 + Math.floor(Math.random() * 250),
                        complexity: 1 + Math.floor(Math.random() * 4),
                    },
                    renderProps: {
                        key: `grouped-item-${index}`,
                        eventHandlers: {},
                    },
                    state: {
                        selected: false,
                        visible: true,
                        expanded: false,
                        loading: false,
                        cached: false,
                    },
                })
            );

            // Different grouping configurations
            const groupingConfigs: GroupingConfig[] = [
                {
                    groupBy: "value.department",
                    sortGroups: true,
                    collapseGroups: false,
                },
                {
                    groupBy: "value.status",
                    sortGroups: false,
                    collapseGroups: Math.random() > 0.5,
                },
                {
                    groupBy: "metadata.category",
                    sortGroups: true,
                    collapseGroups: false,
                },
            ];

            const config =
                groupingConfigs[
                    Math.floor(Math.random() * groupingConfigs.length)
                ];
            renderer.renderGroupedList(componentId, items, config);
        }

        renderer.reset();
    });

    // Selection operations
    bench("selectable list operations", () => {
        const renderer = new MockReactListRenderer();
        const components: string[] = [];

        for (let i = 0; i < 20; i++) {
            const componentId = `selectable-list-${i}`;
            renderer.registerListComponent(componentId);
            components.push(componentId);
        }

        for (let render = 0; render < 80; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];

            const items: ListItem[] = Array.from(
                { length: 200 },
                (_, index) => ({
                    id: `selectable-item-${index}`,
                    value: {
                        name: `Selectable Item ${index}`,
                        selectable: Math.random() > 0.1, // 90% selectable
                        disabled: Math.random() > 0.95, // 5% disabled
                    },
                    metadata: {
                        created: Date.now(),
                        modified: Date.now(),
                        tags: [`tag${index % 6}`],
                        category: `Category ${index % 4}`,
                        priority: Math.random(),
                        size: 100 + Math.floor(Math.random() * 200),
                        complexity: 1 + Math.floor(Math.random() * 3),
                    },
                    renderProps: {
                        key: `selectable-item-${index}`,
                        eventHandlers: {},
                    },
                    state: {
                        selected: Math.random() > 0.8, // 20% pre-selected
                        visible: true,
                        expanded: false,
                        loading: false,
                        cached: false,
                    },
                })
            );

            const selectedItems = new Set(
                items
                    .filter((item) => item.state.selected)
                    .map((item) => item.id)
            );

            const selectionConfigs: SelectionConfig[] = [
                {
                    mode: "single",
                    selectedItems,
                    onSelectionChange: (newSelection) => {
                        // Update selection
                    },
                    selectableFilter: (item) =>
                        item.value.selectable && !item.value.disabled,
                },
                {
                    mode: "multiple",
                    selectedItems,
                    onSelectionChange: (newSelection) => {
                        // Update selection
                    },
                    selectableFilter: (item) => item.value.selectable,
                },
                {
                    mode: "range",
                    selectedItems,
                    onSelectionChange: (newSelection) => {
                        // Update selection
                    },
                },
            ];

            const config =
                selectionConfigs[
                    Math.floor(Math.random() * selectionConfigs.length)
                ];
            renderer.renderSelectableList(componentId, items, config);
        }

        renderer.reset();
    });

    // Complex list operations (filtering + sorting + pagination)
    bench("complex list operations", () => {
        const renderer = new MockReactListRenderer();
        const components: string[] = [];

        for (let i = 0; i < 10; i++) {
            const componentId = `complex-list-${i}`;
            renderer.registerListComponent(componentId);
            components.push(componentId);
        }

        for (let render = 0; render < 40; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];

            const items: ListItem[] = Array.from(
                { length: 1000 },
                (_, index) => ({
                    id: `complex-item-${index}`,
                    value: {
                        name: `Complex Item ${index}`,
                        price: Math.random() * 2000,
                        rating: Math.random() * 5,
                        category: `Category ${index % 12}`,
                        brand: `Brand ${index % 8}`,
                        inStock: Math.random() > 0.2,
                        featured: Math.random() > 0.7,
                    },
                    metadata: {
                        created: Date.now() - Math.random() * 86_400_000 * 365,
                        modified: Date.now() - Math.random() * 86_400_000 * 30,
                        tags: [`tag${index % 20}`, `feature${index % 15}`],
                        category: `Category ${index % 12}`,
                        priority: Math.random(),
                        size: 150 + Math.floor(Math.random() * 400),
                        complexity: 1 + Math.floor(Math.random() * 8),
                    },
                    renderProps: {
                        key: `complex-item-${index}`,
                        eventHandlers: {},
                    },
                    state: {
                        selected: false,
                        visible: true,
                        expanded: false,
                        loading: false,
                        cached: false,
                    },
                })
            );

            // Complex configuration with multiple operations
            const config: ListOperationConfig = {
                filterCriteria: [
                    {
                        field: "value.inStock",
                        operator: "equals",
                        value: true,
                        weight: 1,
                    },
                    {
                        field: "value.rating",
                        operator: "greaterThan",
                        value: 2.5,
                        weight: 1,
                    },
                    {
                        field: "value.price",
                        operator: "between",
                        value: [50, 1500],
                        weight: 1,
                    },
                ],
                sortBy: "value.rating",
                sortDirection: "desc",
                pagination: {
                    page: Math.floor(Math.random() * 10) + 1,
                    pageSize: 20,
                    totalItems: items.length,
                    prefetchPages: 2,
                },
                grouping:
                    Math.random() > 0.5
                        ? {
                              groupBy: "value.category",
                              sortGroups: true,
                              collapseGroups: false,
                          }
                        : undefined,
            };

            renderer.renderList(componentId, items, config);
        }

        renderer.reset();
    });

    // Performance stress test
    bench("list rendering stress test", () => {
        const renderer = new MockReactListRenderer();
        const stressComponents: string[] = [];

        // Create many components with large datasets
        for (let i = 0; i < 5; i++) {
            const componentId = `stress-list-${i}`;
            renderer.registerListComponent(componentId);
            stressComponents.push(componentId);
        }

        for (let render = 0; render < 20; render++) {
            const componentId =
                stressComponents[
                    Math.floor(Math.random() * stressComponents.length)
                ];

            // Very large dataset
            const items: ListItem[] = Array.from(
                { length: 10_000 },
                (_, index) => ({
                    id: `stress-item-${index}`,
                    value: {
                        title: `Stress Item ${index}`,
                        content: `Content ${index}`.repeat(10), // Large content
                        data: Array.from({ length: 50 }, () => Math.random()), // Large data array
                        nested: {
                            level1: {
                                level2: {
                                    level3: `Deep value ${index}`,
                                    array: Array.from(
                                        { length: 20 },
                                        (_, j) => ({
                                            id: j,
                                            value: Math.random(),
                                        })
                                    ),
                                },
                            },
                        },
                    },
                    metadata: {
                        created: Date.now() - Math.random() * 86_400_000 * 365,
                        modified: Date.now(),
                        tags: Array.from(
                            { length: 10 },
                            (_, j) => `tag${j}-${index % 50}`
                        ),
                        category: `Category ${index % 25}`,
                        priority: Math.random(),
                        size: 500 + Math.floor(Math.random() * 1000),
                        complexity: 5 + Math.floor(Math.random() * 10),
                    },
                    renderProps: {
                        key: `stress-item-${index}`,
                        className: `stress-item complexity-${index % 10}`,
                        style: {
                            height: `${40 + (index % 10) * 10}px`,
                            backgroundColor: `hsl(${index % 360}, 50%, 95%)`,
                        },
                        eventHandlers: {
                            onClick: () => Math.random(),
                            onHover: () => Math.random(),
                            onFocus: () => Math.random(),
                            onBlur: () => Math.random(),
                        },
                    },
                    state: {
                        selected: Math.random() > 0.9,
                        visible: Math.random() > 0.05,
                        expanded: Math.random() > 0.8,
                        loading: Math.random() > 0.95,
                        cached: Math.random() > 0.7,
                    },
                })
            );

            // Complex stress configuration
            const stressConfig: ListOperationConfig = {
                filterCriteria: [
                    {
                        field: "state.visible",
                        operator: "equals",
                        value: true,
                        weight: 1,
                    },
                    {
                        field: "metadata.complexity",
                        operator: "greaterThan",
                        value: 7,
                        weight: 1,
                    },
                    {
                        field: "value.title",
                        operator: "contains",
                        value: "Item",
                        weight: 1,
                    },
                ],
                sortBy: "metadata.complexity",
                sortDirection: "desc",
                pagination: {
                    page: 1,
                    pageSize: 100,
                    totalItems: items.length,
                    prefetchPages: 3,
                },
                virtualization: {
                    itemHeight: (index: number) => 50 + (index % 10) * 10,
                    containerHeight: 800,
                    overscan: 20,
                    scrollOffset: Math.random() * 50_000,
                    estimatedItemSize: 75,
                },
                grouping: {
                    groupBy: "metadata.category",
                    sortGroups: true,
                    collapseGroups: false,
                },
            };

            renderer.renderList(componentId, items, stressConfig);
        }

        const finalAnalysis = renderer.analyzeListPerformance();
        renderer.reset();
    });
});
