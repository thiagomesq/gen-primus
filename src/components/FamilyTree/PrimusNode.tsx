import { ExtPrimus } from '@/interfaces/Primus';
import { NodeCard } from './NodeCard';

type NodeProps = {
  primus: ExtPrimus;
  depth: number;
  maxDepth: number;
  isSibling?: boolean; // Adicionado para evitar renderização infinita de irmãos
};

export const PrimusNode = ({ primus, depth, maxDepth, isSibling }: NodeProps) => {
  const father = (primus.father && typeof primus.father === 'object') ? primus.father as ExtPrimus : undefined;
  const mother = (primus.mother && typeof primus.mother === 'object') ? primus.mother as ExtPrimus : undefined;
  const siblings = (primus.siblings?.filter(s => typeof s === 'object') as ExtPrimus[]) || [];
  const middleIndex = Math.ceil(siblings.length / 2);
  const leftSiblings = siblings.slice(0, middleIndex);
  const rightSiblings = siblings.slice(middleIndex);

  const hasParents = (father || mother) && depth < maxDepth;

  return (
    <div className="flex flex-col items-center relative">
      <div className="flex items-start justify-center gap-4">
        {/* Renderiza os irmãos à esquerda */}
        {!isSibling && leftSiblings.map(sibling => (
          <div key={sibling.id} className="flex flex-col items-center pt-30"> {/* pt-12 para alinhar com o nó principal */}
            <NodeCard primus={sibling} />
          </div>
        ))}

        {/* Nó Principal e seus pais */}
        <div className="flex flex-col items-center relative">
          {/* Linha vertical que conecta ao nó principal, se houver pais */}
          {hasParents && <div className="absolute top-22 h-4 w-px bg-gray-400" style={{ left: '50%', transform: 'translateX(-50%)' }} />}

          {hasParents && (
            <div className="flex items-end justify-center w-full gap-8 relative pb-4">
              <div className="flex-1 flex justify-end">
                {mother && <PrimusNode primus={mother} depth={depth + 1} maxDepth={maxDepth} />}
              </div>
              <div className="flex-1 flex justify-start">
                {father && <PrimusNode primus={father} depth={depth + 1} maxDepth={maxDepth} />}
              </div>
              {/* Linha horizontal que conecta os pais */}
              <div className="absolute bottom-0 h-px bg-gray-400" style={{ left: '10%', right: '10%' }} />
            </div>
          )}
          <NodeCard primus={primus} showSpouse={depth === 0} />
        </div>

        {/* Renderiza os irmãos à direita */}
        {!isSibling && rightSiblings.map(sibling => (
          <div key={sibling.id} className="flex flex-col items-center pt-30">
            <NodeCard primus={sibling} />
          </div>
        ))}
      </div>
    </div>
  );
};