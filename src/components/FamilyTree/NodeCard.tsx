import { Card } from '@/components/ui/card';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, HeartPulse, User, Users, Baby } from 'lucide-react';
import { TbGrave2 } from "react-icons/tb";
import { ExtPrimus } from '@/interfaces/Primus';
import { formatDate, calcAge } from '@/lib/utils';
import { gender } from '@/interfaces';
import Image from 'next/image';

export const NodeCard = ({ primus, showSpouse }: { primus: ExtPrimus, showSpouse?: boolean }) => {
  const isFather = primus.gender === 'MASCULINO';
  const baseClasses = isFather
    ? 'bg-primus-blue-light/10 glow-blue halo-blue'
    : 'bg-primus-red-light/10 glow-red halo-red';
  const hoverClasses = isFather
    ? 'bg-sky-50 halo-blue'
    : 'bg-rose-50 halo-red';
  const birth = formatDate(primus.birth);
  const death = formatDate(primus.death);
  const age = calcAge(primus.birth, primus.death);
  const showDeath = !!primus.death;

  console.log("Primus:", primus);
  console.log("Show Spouse:", showSpouse);

  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <Card className={`${baseClasses} border text-xs p-2 w-44 cursor-pointer transition-shadow my-3`}>
          <div className="font-semibold text-sm leading-tight truncate">{primus.name}</div>
          {!showDeath ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {birth}</div>
              {primus.birthPlace && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {primus.birthPlace}</div>}
              {showSpouse && primus.married && primus.marriedWith && primus.marriedWith.length > 0 && (
                <>
                  <Separator className="my-2 text-primus-blue-light" />
                  <span className="font-medium">Cônjuge:</span> {primus.marriedWith.filter(spouse => spouse.actual === true).map(spouse => spouse.name)[0]}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <TbGrave2 className="h-3 w-3" /> {death}
                {age !== undefined && <span className="ml-auto">{age}a</span>}
              </div>
              {primus.deathPlace && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {primus.deathPlace}</div>}
            </div>
          )}
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className={`${hoverClasses} w-80 p-3 space-y-2`}>
        <div className="font-semibold text-base flex items-center gap-2">{primus.photoURL ? <Image src={primus.photoURL} alt={primus.name} width={64} height={64} className="rounded-full h-16 w-16" /> : <User className="h-4 w-4" />} {primus.name}</div>
        <Separator />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3" /> Nascimento:</span>
          <span>{birth}</span>
          {primus.birthPlace && (<> <span className="flex items-center gap-1 font-medium"><MapPin className="h-3 w-3" /> Local nasc.:</span> <span>{primus.birthPlace}</span> </>)}
          {death !== '—' && (<> <span className="flex items-center gap-1 font-medium"><TbGrave2 className="h-3 w-3" /> Falecimento:</span> <span>{death}</span> </>)}
          {primus.deathPlace && (<> <span className="flex items-center gap-1 font-medium"><MapPin className="h-3 w-3" /> Local falec.:</span> <span>{primus.deathPlace}</span> </>)}
          {age !== undefined && (<> <span className="flex items-center gap-1 font-medium"><HeartPulse className="h-3 w-3" /> Idade:</span> <span>{age} anos</span> </>)}
          {primus.gender && (<> <span className="flex items-center gap-1 font-medium"><Users className="h-3 w-3" /> Sexo:</span> <span>{gender[primus.gender]}</span> </>)}
          {Array.isArray(primus.children) && (<> <span className="flex items-center gap-1 font-medium"><Baby className="h-3 w-3" /> Filhos:</span> <span>{primus.children.length}</span> </>)}
        </div>
        {primus.bio && (<> <Separator /> <p className="text-xs leading-snug whitespace-pre-wrap">{primus.bio}</p> </>)}
      </HoverCardContent>
    </HoverCard>
  );
};