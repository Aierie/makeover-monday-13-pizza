function main() {
  const data = [
    { Topping: "Mushrooms", Total: 65, Male: 63, Female: 68 },
    { Topping: "Onion", Total: 62, Male: 62, Female: 63 },
    { Topping: "Ham", Total: 61, Male: 66, Female: 56 },
    { Topping: "Peppers", Total: 60, Male: 63, Female: 57 },
    { Topping: "Chicken", Total: 56, Male: 60, Female: 52 },
    { Topping: "Pepperoni", Total: 56, Male: 66, Female: 46 },
    { Topping: "Tomato", Total: 51, Male: 49, Female: 54 },
    { Topping: "Bacon", Total: 49, Male: 56, Female: 43 },
    { Topping: "Pineapple", Total: 42, Male: 40, Female: 44 },
    { Topping: "Sweetcorn", Total: 42, Male: 38, Female: 46 },
    { Topping: "Beef", Total: 36, Male: 47, Female: 26 },
    { Topping: "Olives", Total: 33, Male: 33, Female: 32 },
    { Topping: "Chillies", Total: 31, Male: 42, Female: 22 },
    { Topping: "Jalapenos", Total: 30, Male: 39, Female: 21 },
    { Topping: "Spinach", Total: 26, Male: 20, Female: 32 },
    { Topping: "Pork", Total: 25, Male: 34, Female: 17 },
    { Topping: "Tuna", Total: 22, Male: 23, Female: 21 },
    { Topping: "Anchovies", Total: 18, Male: 21, Female: 15 },
    { Topping: "Something else", Total: 11, Male: 12, Female: 10 },
  ];

  const config = {
    colors: {
      defaultBar: "grey",
      // Mushrooms: "#65513e",
      // Onion: "#5b7a3f",
      // Ham: "#b54471",
      // Chillies: "#E32227",
      // Olives: "#72730d",
      // Beef: "#790604",
      // Pepperoni: "#843000",
      // Peppers: "#456c3b",
    },
  };

  const Chart = Vue.component("BarChart", {
    template: `
    <g :transform="position">
      <g v-for="(datum, i) in processedData" :key="i" :transform="datum.transform" @click="highlight(datum.text)">
        <rect :width="datum.width" :height="datum.height" :fill="datum.color"></rect>
        <text v-if="highlighted === datum.text" :x="datum.percentagePosition" :text-anchor="datum.percentageAnchor" :fill="datum.color" :font-size="barHeight - 2" alignment-baseline="hanging">{{datum.value}}%</text>
      </g>
      <g v-for="(line, i) in linePositions" :key="i">
      </g>
    </g>
    `,
    props: {
      start: { type: Object, default: () => ({ x: 0, y: 0 }) },
      data: {
        type: Array,
        required: true,
      },
      width: {
        type: Number,
        required: true,
      },
      barHeight: {
        type: Number,
        default: 30,
      },
      barSpace: {
        type: Number,
        default: 10,
      },
      highlighted: {
        type: String,
        default: "",
      },
      align: {
        type: String,
        default: "left",
      },
      scaleMax: {
        type: Number,
        default: null,
      },
      scaleMin: {
        type: Number,
        default: null,
      },
      linePositions: {
        type: Array,
        default: () => [],
      },
      defaultColor: {
        type: String,
        default: config.colors.defaultBar,
      },
    },
    computed: {
      position() {
        return `translate(${this.start.x}, ${this.start.y})`;
      },
      processedData() {
        return this.data.map((o, i) => {
          const value = o.value;
          return {
            width: this.scaleW(value),
            height: this.barHeight,
            x: this.scaleX(value),
            transform: `translate(${this.scaleX(value)}, ${i *
              (this.barHeight + this.barSpace)})`,
            percentagePosition:
              this.align === "left"
                ? this.scaleW(value) + this.scaleX(value) + 5
                : -5,
            percentageAnchor: this.align === "left" ? "start" : "end",
            color:
              this.highlighted === o.text
                ? config.colors[o.text] || "black"
                : this.defaultColor,
            text: o.text,
            value,
          };
        });
      },
      scaleX() {
        return (value) => {
          if (this.align === "left") return 0;
          else if (this.align === "right")
            return this.width - this.scaleW(value);
        };
      },
      scaleW() {
        const maxW = this.width;
        return (value) =>
          value ? (Math.abs(value) / this.range) * maxW : value;
      },
      values() {
        return this.data.map((o) => o.value);
      },
      maxValue() {
        return Math.max(...this.values);
      },
      minValue() {
        return Math.min(...this.values);
      },
      range() {
        return this.scaleMax;
      },
    },
    methods: {
      highlight(id) {
        this.$emit("highlight", id);
      },
    },
  });

  new Vue({
    el: "#app",
    components: {
      BarChart: Chart,
    },
    data() {
      return {
        rawData: data,
        barHeight: 15,
        barSpace: 2,
        highlighted: "Beef",
        currentPop: "Total",
        describe: {
          Total: "Brits",
          Male: "male Brits",
          Female: "female Brits",
        },
        diffWidth: 300,
        diffHeight: 240,
      };
    },
    computed: {
      popView() {
        return this.toData(
          this.sort(this.clone(this.rawData), this.currentPop),
          this.currentPop
        );
      },
      popToppings() {
        return this.popView.map((o) => o.text);
      },
      versus() {
        return this.rawData.map((o) => ({
          text: o.Topping,
          value: this.differences[o.Topping],
          color: this.highlighted === o.Topping ? "black" : undefined,
        }));
      },
      malePreference() {
        return this.sort(
          this.versus
            .filter((o) => o.value < 0)
            .map((o) => ({ ...o, value: Math.abs(o.value) })),
          "value"
        );
      },
      maleToppings() {
        return this.malePreference.map((o) => o.text);
      },
      femalePreference() {
        return this.sort(this.versus.filter((o) => o.value > 0), "value");
      },
      femaleToppings() {
        return this.femalePreference.map((o) => o.text);
      },
      differences() {
        const res = {};
        this.rawData.forEach((o) => {
          res[o.Topping] = o.Female - o.Male;
        });
        return res;
      },
      ranks() {
        const res = { Total: {}, Male: {}, Female: {} };

        ["Total", "Female", "Male"].forEach((key) =>
          this.sort(this.clone(this.rawData), key).forEach(
            (o, i) =>
              (res[key][o.Topping] = `${+i + 1}${
                i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"
              }`)
          )
        );

        return res;
      },
      percents() {
        const res = { Total: {}, Male: {}, Female: {} };

        ["Total", "Female", "Male"].forEach((key) =>
          this.rawData.forEach((o, i) => (res[key][o.Topping] = o[key]))
        );

        return res;
      },
    },
    methods: {
      setHighlight(topping) {
        this.highlighted = topping;
      },
      sort(ar, sorter) {
        return ar.sort((a, b) => b[sorter] - a[sorter]);
      },
      clone(ar) {
        return JSON.parse(JSON.stringify(ar));
      },
      toData(ar, valueKey) {
        return ar.map((o) => ({
          text: o.Topping,
          value: o[valueKey],
          color: this.highlighted === o.Topping ? "black" : undefined,
        }));
      },
      getColor(topping) {
        return config.colors[topping] || "black";
      },
      nextSort() {
        const sorts = ["Total", "Female", "Male"];
        const idx = sorts.indexOf(this.currentPop);
        this.currentPop = sorts[(idx + 1) % sorts.length];
      },
    },
  });
}
