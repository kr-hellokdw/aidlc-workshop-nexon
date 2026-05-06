import type { Category } from '../../common/types';
import styles from './CategoryTabs.module.css';

interface Props {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryTabs({ categories, selected, onSelect }: Props) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${selected === null ? styles.active : ''}`}
        onClick={() => onSelect(null)}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.tab} ${selected === cat.id ? styles.active : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
