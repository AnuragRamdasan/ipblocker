// import { json } from '@remix-run/node';
// import { getCountriesForShop } from '../models/countries';
// import prisma from '../db.server';

// export const loader = async ({ params }) => {
//   const shop = params.shop
//   const session = await prisma.ipblockerSession.findMany({
//     where: {
//       shop: shop
//     }
//   })

//   const countries = await getCountriesForShop(session[0].accessToken)

//   return json(
//     { countries }    
//   );
// };
