import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { BmiTool } from "./tool";

export function BmiPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="Body mass index compares weight with height. It is a quick screening number for adults, not a measure of body fat."
      tool={<BmiTool />}
      method={
        <>
          <p>
            BMI is weight in kilograms divided by the square of height in metres. Imperial inputs are converted
            exactly (1 lb = 0.45359237 kg, 1 in = 2.54 cm) before the division.
          </p>
          <Formula>BMI = weight (kg) / height (m)²</Formula>
          <p>
            The result is rounded to one decimal and placed in the <strong>CDC adult categories</strong>:
            underweight below 18.5, healthy weight from 18.5 to 24.9, overweight from 25.0 to 29.9 and obesity
            from 30.0. The category follows the one-decimal value, as in CDC’s example table: at 5 ft 9 in, 125 lb
            (BMI 18.46, shown as 18.5) is healthy weight and 169 lb (24.96, shown as 25.0) is overweight. Vector
            Body applies the same cutoffs to the unrounded BMI, so for a BMI less than 0.05 below 18.5, 25 or 30
            the app names the category below the one shown here.
          </p>
          <p>
            The healthy-weight range for your height runs from the lightest to the heaviest weight, to 0.1 kg or
            lb, whose BMI shows as 18.5 to 24.9: 125.0 to 168.9 lb at 5 ft 9 in. Outside it, the change to reach
            it runs to the nearer end of the range and is rounded up to the next 0.1, so that it is enough.
          </p>
          <p>
            BMI does not separate muscle from fat. A muscular person can read as overweight, and an older adult
            with little muscle can read as healthy. Body-fat percentage and FFMI describe composition better.
          </p>
        </>
      }
      caveat="For adults aged 20 and over. Children and teens use age- and sex-specific percentiles instead. BMI is a screening tool, not a diagnosis."
      sources={[
        { label: "CDC. Adult BMI categories.", href: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html" },
        { label: "CDC. About body mass index (BMI).", href: "https://www.cdc.gov/bmi/about/index.html" },
      ]}
    />
  );
}
