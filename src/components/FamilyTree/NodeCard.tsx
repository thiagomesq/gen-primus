import { Card } from '@/components/ui/card';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, HeartPulse, User, Users, Baby } from 'lucide-react';
import { TbGrave2 } from "react-icons/tb";
import { ExtPrimus } from '@/interfaces/Primus';
import { formatDate, calcAge } from '@/lib/utils';
import { gender } from '@/interfaces';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { Edit } from 'lucide-react';

export const NodeCard = ({ primus, showSpouse }: { primus: ExtPrimus, showSpouse?: boolean }) => {
  const { user } = useAuth();
  const isMale = primus.gender === 'MASCULINO';
  const hasGender = primus.gender === 'MASCULINO' || primus.gender === 'FEMININO';

  const baseClasses = hasGender
    ? (isMale ? 'bg-primus-blue-light/10 glow-blue halo-blue' : 'bg-primus-red-light/10 glow-red halo-red')
    : 'bg-gray-100 dark:bg-gray-700';

  const hoverClasses = hasGender
    ? (isMale ? 'bg-sky-50 dark:bg-primus-blue-light/20 halo-blue' : 'bg-rose-50 dark:bg-primus-red-light/20 halo-red')
    : 'bg-gray-200 dark:bg-white/10';

  const birth = formatDate(primus.birth);
  const death = formatDate(primus.death);
  const age = calcAge(primus.birth, primus.death);
  const showDeath = !!primus.death;

  console.log("Primus:", primus);
  console.log("Show Spouse:", showSpouse);

  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <Card className={`${baseClasses} border text-xs p-2 w-44 cursor-pointer transition-shadow my-3 relative group`}>
          {user && (user.contributor || user.admin || primus.id === user.perfil) && (
            <Link href={`/perfil/${primus.id}`}>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </div>
            </Link>
          )}
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