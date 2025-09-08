import { ExtPrimus } from '@/interfaces/Primus';
import { NodeCard } from './NodeCard';

type NodeProps = {
  primus: ExtPrimus;
  depth: number;
  maxDepth: number;
};

export const PrimusNode = ({ primus, depth, maxDepth }: NodeProps) => {
  const father = (primus.father && typeof primus.father === 'object') ? primus.father as ExtPrimus : undefined;
  const mother = (primus.mother && typeof primus.mother === 'object') ? primus.mother as ExtPrimus : undefined;

  const hasParents = (father || mother) && depth < maxDepth;

  return (
    <div className="flex flex-col items-center">
      {hasParents && (
        <div className="flex items-end justify-between w-full gap-8 relative pb-4">
          <div className="flex-1 flex justify-end">
            {mother && <PrimusNode primus={mother} depth={depth + 1} maxDepth={maxDepth} />}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-px bg-gray-400 h-4" />
          <div className="flex-1 flex justify-start">
            {father && <PrimusNode primus={father} depth={depth + 1} maxDepth={maxDepth} />}
          </div>
          <div className="absolute top-full left-0 right-0 flex justify-between px-[12%]">
            {mother && <div className="h-px bg-gray-400 flex-1" />}
            {father && <div className="h-px bg-gray-400 flex-1" />}
          </div>
        </div>
      )}
      <NodeCard primus={primus} showSpouse={depth === 0} />
    </div>
  );
};