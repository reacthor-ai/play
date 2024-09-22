import Link from "next/link";
import {Separator} from "@/components/ui/separator";
import {NAVIGATION} from "@/utils/navigation/routes";

type NavItem = {
  label: string;
  path: string;
};

const getNavItems = (obj: Record<string, string | Record<string, string>>, prefix = ''): NavItem[] => {
  return Object.entries(obj).flatMap(([key, value]) => {
    if (typeof value === 'string') {
      return {label: key, path: value};
    } else {
      return getNavItems(value, `${prefix}${key} `);
    }
  });
};

export async function DashboardCustomLayout({children}: Readonly<{ children: React.ReactNode; }>) {

  const navItems = getNavItems(NAVIGATION.Dashboard);
  return (
    <>
      <nav className="bg-[#10162e] text-white w-full">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-lg font-bold leading-tight">
                  reac<i>thor</i>.
                </h1>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={'px-3 py-2 rounded-md text-md font-medium'}
                    >
                      {(item.label)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <Separator/>

      <div className='bg-[#090d21] h-[90vh]'>
        {children}
      </div>

    </>
  );
}
