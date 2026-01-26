import { AnimationsPanel, type LayoutFilter } from '../AnimationsPanel';
import { FilterPreview } from '../FilterPreview';
import { SidebarSection } from '../ui/SidebarPrimitives';

const FILTER_OPTIONS: { id: LayoutFilter; label: string }[] = [
  { id: 'favorites', label: 'Fav' },
  { id: 'text', label: 'Text' },
  { id: 'single', label: 'Single' },
  { id: 'duo', label: 'Duo' },
  { id: 'trio', label: 'Trio' },
];

type AnimationsTabProps = {
  layoutFilter: LayoutFilter;
  onFilterChange: (filter: LayoutFilter) => void;
};

export const AnimationsTab = ({ layoutFilter, onFilterChange }: AnimationsTabProps) => (
  <>
    <SidebarSection borderBottom padded>
      <div className="flex gap-1">
        {FILTER_OPTIONS.map((option) => {
          const isActive = layoutFilter === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onFilterChange(option.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-accent text-black'
                  : 'bg-ui-panel/50 text-ui-muted hover:bg-ui-panel hover:text-ui-text'
              }`}
            >
              <FilterPreview filter={option.id} isActive={isActive} />
              <span className="text-[9px] font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </SidebarSection>
    <AnimationsPanel filter={layoutFilter} />
  </>
);
