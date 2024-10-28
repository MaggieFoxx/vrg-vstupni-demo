# VRG vstupní demo

Táto aplikácia využíva framework React a knižnicu OpenLayers na vytvorenie jednoduchej webovej aplikácie, ktorá umožňuje:

- Zobraziť mapu z online zdroja
- Poskytovať nasledujúce nástroje:
  - Meranie vzdialenosti - zobrazenie dĺžky a azimutu zadanej úsečky na mape
  - Meranie uhla - zobrazenie veľkosti uhla zvieraného dvoma úsečkami s jedným spoločným bodom
  - Kreslenie a modifikácia nakreslenej polyčáry

Parametre potrebné pre uvedenú funkcionalitu je možné zadať pomocou myši na mape alebo číselne pomocou vstupných ovládacích prvkov. Tzn. je nutné vytvoriť a vhodne použiť input kontroly pre zadanie, zobrazenie a editáciu uhla a vzdialenosti číselnými hodnotami s tým, že bude možné prepínať jednotky (napr. kilometre/míle, stupne/radiány).

## Ako spustiť aplikáciu

### Predpoklady

- Node.js (odporúčaná verzia je 14.x alebo vyššia)
- npm (Node Package Manager) alebo yarn

### Kroky pre spustenie

Najprv klonujte repozitár do vášho lokálneho počítača:

```sh
git clone https://github.com/MaggieFoxx/vrg-vstupni-demo.git
cd vrg-vstupni-demo

npm install
npm run dev
```
Aplikácia by mala byť dostupná na adrese http://localhost:3000.

### Nasadená aplikácia
Aplikácia je tiež nasadená a dá sa otestovať tu: https://vrg-vstupni-demo.vercel.app/

## Použité technológie
- React
- OpenLayers
- Tailwind CSS (pre štýlovanie)
- Vercel (pre nasadenie)

### Autor
Magdaléna Lišková