
module test {

    export class TestInitClass extends suntdd.TestCase {

        protected $beforeAll(): void {
            this.$addTest(1, TestWaitClass);
            this.$addTest(2, TestButtonClass);
        }
    }
}