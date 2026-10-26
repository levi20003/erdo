# Béta visszajelzés – szövegek és kérdőív

Két része van: az alkalmazásban megjelenő rövid kérdés (már be van építve), és a béta-tesztelőknek küldött heti kérdőív. A kérdések nem vezetnek rá a „jó” válaszra, és arra kérdeznek, ami **történt**, nem arra, amit a tesztelő „szerint” tenne.

## 1. Az alkalmazásban (beépítve, 1.0.0)

- **Mikor:** az 5. teljesített kör után, szünetben vagy nyugalmi állapotban – **soha fókusz közben**.
- **Szöveg:** „Hogy tetszik a FocusGrove? Már 5 kört teljesítettél. Egy kattintás, és segítesz jobbá tenni.”
- **Válasz:** 1–5 csillag; utána „Köszönöm! Ha van ötleted vagy hibát találtál, írd meg nyugodtan.” + „Javaslat írása” (előre kitöltött GitHub-bejelentés, amit a tesztelő átnéz, mielőtt elküldi).
- **Elutasítás:** „Most nem” – legfeljebb kétszer kérdez újra, 14 nap és 10 újabb kör után.
- A csillag csak a tesztelő eszközén tárolódik.

## 2. Meghívó a bétára (üzenet / e-mail)

> Szia! Készítettem egy ingyenes, offline Pomodoro-appot: minden 25 perces fókusszal nő egy fa az erdődben, és ha 5 másodpercnél tovább kilépsz, elszárad. Kipróbálnád a következő 3 hétben? Annyit kérek, hogy használd, amikor tanulsz vagy dolgozol, és hetente egyszer tölts ki egy 2 perces kérdőívet. Nem kell fiók, semmilyen adatot nem gyűjt.
> Link: https://levi20003.github.io/erdo/

## 3. Heti kérdőív (2 perc)

1. Hány fókuszkört **fejeztél be** ezen a héten? (Az Összes fókuszidő kártyán látod.) — szám
2. Milyen hosszú most a napi sorozatod? — szám
3. Mikor használtad legutóbb? — ma / tegnap / 2–4 napja / több mint 4 napja
4. Mire használtad? — tanulás / munka / hobbi / egyéb: ___
5. Elbukott köröd volt? Ha igen, **mi történt** közvetlenül előtte? — szabad szöveg
6. Volt olyan, hogy úgy érezted, a szigorú mód **igazságtalanul** buktatott el? Írd le a helyzetet. — szabad szöveg
7. Mi volt a legidegesítőbb dolog a héten az appban? — szabad szöveg
8. Mit csináltál, amikor nem a FocusGrove-ot használtad fókuszáláshoz? — szabad szöveg
9. Ha holnaptól nem lenne FocusGrove, mit használnál helyette? — szabad szöveg
10. Megosztottad valakivel az erdődet vagy az appot? — igen / nem; ha nem, miért nem?
11. *(Opcionális)* Ha hibát láttál: Beállítások → Hibanapló → Letöltés, és csatold ide. — fájl

### Amit szándékosan nem kérdezünk

- „Tetszik az app?” – udvariassági választ kapnánk.
- „Fizetnél érte?” / „Használnád, ha…?” – feltételes kérdésre megbízhatatlan a válasz.
- Személyes adat a kérdőív kitöltéséhez szükségesen túl.

## 4. Kiértékelés (a béta végén)

A célokat lásd: [PRODUCT_METRICS.md](../../PRODUCT_METRICS.md). Az 5–6. kérdés válaszaiból derül ki, hogy az 5 másodperces türelmi idő jól van-e belőve.
