import {
  Check,
  X,
  Trophy,
  ArrowRight,
  ArrowClockwise,
  BookOpen,
  MagnifyingGlass,
  Clock,
  ClockCounterClockwise,
  ListBullets,
  ChartBar,
  Stack,
  Target,
  Star,
  Lightning,
  Medal,
  Lock,
  User,
  PencilSimple,
  Code,
  House,
  Books,
  SignOut,
} from "@phosphor-icons/react";

function makeIcon(PhosphorIcon, defaultWeight = "duotone") {
  function Icon({ size = 20, weight = defaultWeight, ...props }) {
    return <PhosphorIcon size={size} weight={weight} {...props} />;
  }
  return Icon;
}

export const CheckIcon = makeIcon(Check, "bold");
export const XIcon = makeIcon(X, "bold");
export const ArrowRightIcon = makeIcon(ArrowRight, "bold");
export const LockIcon = makeIcon(Lock, "bold");

export const TrophyIcon = makeIcon(Trophy);
export const RefreshIcon = makeIcon(ArrowClockwise);
export const BookOpenIcon = makeIcon(BookOpen);
export const SearchIcon = makeIcon(MagnifyingGlass);
export const ClockIcon = makeIcon(Clock);
export const HistoryIcon = makeIcon(ClockCounterClockwise);
export const ListIcon = makeIcon(ListBullets);
export const BarChartIcon = makeIcon(ChartBar);
export const LayersIcon = makeIcon(Stack);
export const TargetIcon = makeIcon(Target);
export const StarIcon = makeIcon(Star);
export const ZapIcon = makeIcon(Lightning);
export const AwardIcon = makeIcon(Medal);
export const UserIcon = makeIcon(User);
export const EditIcon = makeIcon(PencilSimple);
export const CodeIcon = makeIcon(Code);
export const HomeIcon = makeIcon(House);
export const CoursesIcon = makeIcon(Books);
export const LogoutIcon = makeIcon(SignOut);